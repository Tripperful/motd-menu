import {
  WsMessage,
  WsMessageCallback,
  WsMessageType,
  WsSubscriberCallback,
  uuid,
} from '@motd-menu/common';
import { createHash } from 'crypto';
import type http from 'http';
import { dbgErr, dbgWarn } from 'src/util';
import { RawData, WebSocket, WebSocketServer } from 'ws';

export let wsApi: WsApi = null;

export class WsApi {
  private wsServer: WebSocketServer = null;

  public static init(httpServer: http.Server) {
    const authPw = process.env.MOTD_WS_AUTH_PASSWORD;

    if (!authPw) {
      throw new Error(
        'MOTD_WS_AUTH_PASSWORD env variable must be set to establish a secure WS connection',
      );
    }

    const authMd5Hashes = authPw
      .split('\n')
      .map((pw) => createHash('md5').update(pw).digest('hex').toLowerCase());

    if (!wsApi) {
      wsApi = new WsApi(httpServer, authMd5Hashes);
    }

    return wsApi;
  }

  // Maps unique remote IDs to their respective WS sockets
  private remotesById: Record<string, WebSocket> = {};

  private getRemoteId(remoteWs: WebSocket) {
    for (const [id, ws] of Object.entries(this.remotesById)) {
      if (ws === remoteWs) {
        return id;
      }
    }
    return null;
  }

  private constructor(httpServer: http.Server, authMd5Hashes: string[]) {
    this.wsServer = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (req, socket, head) => {
      const searchParams = new URL(req.url, `http://${req.headers.host}`)
        ?.searchParams;

      const auth = searchParams?.get('auth')?.toLowerCase();
      const remoteId = searchParams?.get('guid');

      if (!authMd5Hashes.includes(auth) || !remoteId) {
        const ip = req.socket.remoteAddress;
        const port = req.socket.remotePort;

        console.warn(
          `Unauthorized WS upgrade request from ${ip}:${port}, request URL: ${req.url}`,
        );

        return socket.destroy();
      }

      this.wsServer.handleUpgrade(req, socket, head, (ws) => {
        this.remotesById[remoteId] = ws;
        this.wsServer.emit('connection', ws, req, remoteId);
      });
    });

    this.wsServer.on('connection', (remoteWs, req) => {
      const { remoteAddress, remotePort } = req.socket;
      const remoteHost = `${remoteAddress}:${remotePort}`;

      console.log(`New WS connection: ${remoteHost}`);

      remoteWs.on('message', (data, isBinary) => {
        try {
          this.onWsMessage(data, isBinary, remoteWs);
        } catch (e) {
          dbgErr(e);

          remoteWs.send(
            JSON.stringify({
              type: 'ws_error',
              error: e,
              errorMsg: e?.message,
              errorStack: e?.stack,
              dataBase64: data.toString('base64'),
            }),
          );
        }
      });

      remoteWs.on('close', () => {
        const remoteId = this.getRemoteId(remoteWs);

        if (remoteId) {
          delete this.remotesById[remoteId];
        }
      });
    });
  }

  private subscribers: Record<string, WsSubscriberCallback> = {};

  /**
   * @returns A function to unsubscribe.
   */
  public subscribe<TData>(
    action: WsMessageType,
    callback: WsSubscriberCallback<TData>,
  ) {
    const subId = action + ' ' + uuid();

    this.subscribers[subId] = callback;

    return () => {
      delete this.subscribers[subId];
    };
  }

  send<TData>(
    remoteId: string,
    type: WsMessageType,
    data?: TData,
    guid?: string,
  ) {
    const remoteWs = this.remotesById[remoteId];

    if (!remoteWs?.OPEN) {
      throw new Error(
        'Trying to send a WS message to a disconnected remote: ' + remoteWs,
      );
    }

    const msg: WsMessage = { type };

    if (guid) {
      msg.guid = guid;
    }

    if (data) {
      msg.data = data;
    }

    remoteWs.send(JSON.stringify(msg));
  }

  private responseHandlers: Record<string, WsMessageCallback> = {};

  public async request<TReqData = unknown, TResData = unknown>(
    remoteId: string,
    type: WsMessageType,
    data?: TReqData,
    timeout = 10000,
  ) {
    return await new Promise<WsMessage<TResData>>(async (res, rej) => {
      try {
        setTimeout(() => rej('Timed out'), timeout);

        const guid = uuid();

        this.responseHandlers[guid] = res as (msg: WsMessage<TResData>) => void;

        this.send(remoteId, type, data, guid);
      } catch (e) {
        rej(e);
      }
    });
  }

  private onWsMessage(data: RawData, isBinary: boolean, remoteWs: WebSocket) {
    if (isBinary) {
      throw new Error('Binary WS messages are not supported');
    }

    const utf8 = data.toString('utf-8');
    const msg = JSON.parse(utf8) as WsMessage;
    const msgType = msg.type;

    if (!msgType) {
      throw new Error('Incoming WS message without type: ' + utf8);
    }

    const responseCallback = this.responseHandlers[msg.guid];

    if (responseCallback) {
      delete this.responseHandlers[msg.guid];

      try {
        responseCallback(msg);
      } catch {
        dbgWarn(
          `Error in WS request callback: ${JSON.stringify({
            msg,
          })}`,
        );
      }
    } else {
      const remoteId = this.getRemoteId(remoteWs);

      let subCount = 0;

      for (const [subId, callback] of Object.entries(this.subscribers)) {
        const subMsgType = subId.split(' ')[0];

        if (subMsgType === msg.type) {
          subCount++;

          try {
            const responsePromise = callback(msg);

            if (responsePromise) {
              responsePromise.then((res) => {
                if (res) {
                  this.send(remoteId, res.type, res.data, msg.guid);
                }
              });
            }
          } catch {
            dbgWarn(
              `Error in WS subscriber callback: ${JSON.stringify({
                msg,
              })}`,
            );
          }
        }
      }

      if (subCount === 0) {
        dbgWarn(`Unsupported incoming WS message: ${utf8}`);
      }
    }
  }
}
