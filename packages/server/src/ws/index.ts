import {
  OnlineServerInfo,
  ServerInfo,
  WsMessage,
  WsMessageCallback,
  WsMessageType,
  WsSubscriberCallback,
  uuid,
} from '@motd-menu/common';
import type http from 'http';
import { dbgErr, dbgWarn } from 'src/util';
import { RawData, WebSocket, WebSocketServer } from 'ws';

export let wsApi: WsApi = null;

export class WsApi {
  private wsServer: WebSocketServer = null;

  public static init(
    httpServer: http.Server,
    authenticate: (authKey: string) => Promise<ServerInfo>,
  ) {
    if (!wsApi) {
      wsApi = new WsApi(httpServer, authenticate);
    }

    return wsApi;
  }

  // Maps WS session IDs to their respective WS sockets and remote IDs
  private remotesBySessionId: Record<
    string,
    { ws: WebSocket; remoteId: number; serverInfo: ServerInfo }
  > = {};

  public getConnectedServers() {
    return Object.entries(this.remotesBySessionId).map(
      ([sessionId, { serverInfo }]) =>
        ({
          sessionId,
          serverInfo,
        }) as OnlineServerInfo,
    );
  }

  private getSessionId(remoteWs: WebSocket) {
    for (const [id, { ws }] of Object.entries(this.remotesBySessionId)) {
      if (ws === remoteWs) {
        return id;
      }
    }

    return null;
  }

  private constructor(
    httpServer: http.Server,
    authenticate: (authKey: string) => Promise<ServerInfo>,
  ) {
    this.wsServer = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', async (req, socket, head) => {
      const searchParams = new URL(req.url, `http://${req.headers.host}`)
        ?.searchParams;

      const auth = searchParams?.get('auth')?.toLowerCase();
      const sessionId = searchParams?.get('guid');
      const serverInfo = await authenticate(auth);
      const remoteId = serverInfo?.id;
      const ip = req.socket.remoteAddress.split(':').pop();
      const port = req.socket.remotePort;
      serverInfo.ip = ip;
      serverInfo.port = port;

      if (!(remoteId && sessionId)) {
        console.warn(
          `Unauthorized WS upgrade request from ${ip}:${port}, request URL: ${req.url}`,
        );

        return socket.destroy();
      }

      const existingRemote = Object.values(this.remotesBySessionId).find(
        (r) => r.remoteId === remoteId,
      );

      if (existingRemote) {
        console.warn(
          `Duplicate connection from ${existingRemote.serverInfo.name}, dropping the old connection`,
        );

        existingRemote.ws.close();
      }

      console.log(
        `${serverInfo.name} server connected to WS: ${JSON.stringify(
          {
            sessionId,
            remoteId,
            address: ip + ':' + port,
          },
          undefined,
          2,
        )}`,
      );

      this.wsServer.handleUpgrade(req, socket, head, (ws) => {
        this.remotesBySessionId[sessionId] = { ws, remoteId, serverInfo };
        this.wsServer.emit('connection', ws, req);
        console.log(
          `Connected servers: ${Object.keys(this.remotesBySessionId).length}`,
        );
      });
    });

    this.wsServer.on('connection', (remoteWs) => {
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
        const sessionId = this.getSessionId(remoteWs);

        if (sessionId) {
          const { serverInfo } = this.remotesBySessionId[sessionId];
          delete this.remotesBySessionId[sessionId];

          console.log(`${serverInfo.name} server disconnected from WS`);
          console.log(
            `Connected servers: ${Object.keys(this.remotesBySessionId).length}`,
          );
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
    sessionId: string,
    type: WsMessageType,
    data?: TData,
    guid?: string,
  ) {
    const ws = this.remotesBySessionId[sessionId]?.ws;

    if (!ws?.OPEN) {
      throw new Error(
        'Trying to send a WS message to a disconnected remote: ' + sessionId,
      );
    }

    const msg: WsMessage = { type };

    if (guid) {
      msg.guid = guid;
    }

    if (data) {
      msg.data = data;
    }

    ws.send(JSON.stringify(msg));
  }

  private responseHandlers: Record<string, WsMessageCallback> = {};

  public async request<TReqData = unknown, TResData = unknown>(
    sessionId: string,
    type: WsMessageType,
    data?: TReqData,
    timeout = 10000,
  ) {
    return await new Promise<WsMessage<TResData>>(async (res, rej) => {
      try {
        setTimeout(() => rej('Timed out'), timeout);

        const guid = uuid();

        this.responseHandlers[guid] = res as (msg: WsMessage<TResData>) => void;

        this.send(sessionId, type, data, guid);
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
      const sessionId = this.getSessionId(remoteWs);
      const { remoteId } = this.remotesBySessionId[sessionId];

      let subCount = 0;

      for (const [subId, callback] of Object.entries(this.subscribers)) {
        const subMsgType = subId.split(' ')[0];

        if (subMsgType === msg.type) {
          subCount++;

          try {
            const responsePromise = callback(msg, remoteId);

            if (responsePromise) {
              responsePromise.then((res) => {
                if (res) {
                  this.send(sessionId, res.type, res.data, msg.guid);
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
