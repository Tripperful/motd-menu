import { createHash } from 'crypto';
import { RemoteInfo, Socket, createSocket } from 'dgram';
import { dbgInfo, uuid } from 'src/util';
import { aesDecrypt, aesEncrypt } from 'src/util/aes';

export const enum JsonUdpMessageType {
  GetSettingsRequest = 0,
  GetSettingsResponse,
  SetSettings,
  ConnectionStats,
  SmurfCheckRequest,
  SmurfCheckResponse,
  NameCheckRequest,
  NameCheckResponse,
  MapsRequest,
  MapsResponse,
  CvarsRequest,
  CvarsResponse,
  OnlinePlayersRequest,
  OnlinePlayersResponse,
  SetCvar,
  SetPlayerTeam,
  ChangeLevel,
  StartMatch,
  MotdAuthRequest,
  MotdAuthResponse,
  MotdMenuClose,
  RequestTypeUpperBound,
  RequestTypeLowerBound = GetSettingsRequest,
}

export interface JsonUdpMessage<TData = unknown> {
  type: JsonUdpMessageType;
  guid?: string;
  data?: TData;
}

export type JsonUdpMessageCallback<TData = unknown> = (
  msg: JsonUdpMessage<TData>,
  rinfo: RemoteInfo,
) => void | Promise<JsonUdpMessage>;

export class JsonUdp {
  private aesKey: Buffer;
  private socket: Socket;

  constructor(
    private port: number,
    password?: string,
    private name = 'UDP',
  ) {
    if (password) {
      this.aesKey = Buffer.from(
        createHash('md5').update(password).digest('hex'),
        'hex',
      );
    } else {
      console.warn(
        `MOTD_AES_PASSWORD environment variable was not passed, no encryption will be used!`,
      );
    }
  }

  private get prefix() {
    return `${this.name} [${this.port}]`;
  }

  public async connect(forceReconnect = false) {
    if (this.socket) {
      if (forceReconnect) {
        this.socket.disconnect();

        delete this.socket;
      } else return;
    }

    try {
      this.socket = await new Promise<Socket>((res, rej) => {
        const socket = createSocket('udp4');

        socket.on('listening', () => {
          console.info(`${this.prefix} - listening`);

          res(socket);
        });

        socket.on('error', (reason) => {
          console.warn(`${this.prefix} - error: ${reason.message}`);
        });

        socket.on('close', () => {
          console.warn(`${this.prefix} - closed`);

          delete this.socket;
        });

        socket.on('message', (data, rinfo) => {
          const msgStr = this.aesKey
            ? aesDecrypt(data.toString('binary'), this.aesKey)
            : data.toString('utf-8');

          const msg: JsonUdpMessage = JSON.parse(msgStr);

          const responseCallback = this.responseHandlers[msg.guid];

          if (responseCallback) {
            delete this.responseHandlers[msg.guid];
            try {
              responseCallback(msg, rinfo);
            } catch {}
          } else {
            for (const callback of Object.values(this.subscribers)) {
              try {
                const responsePromise = callback(msg, rinfo);

                if (responsePromise) {
                  responsePromise.then((res) =>
                    this.send(
                      rinfo.address,
                      rinfo.port,
                      res.type,
                      res.data,
                      msg.guid,
                    ),
                  );
                }
              } catch {}
            }
          }

          const { address, port } = rinfo;

          dbgInfo(
            `${this.prefix} - incoming message from ${address}:${port}\nMessage data: ${msgStr}`,
          );
        });

        socket.bind(this.port);

        setTimeout(() => rej('Timed out'), 5000);
      });
    } catch (error) {
      console.error(`${this.prefix} - failed to bind: ${error}`);

      delete this.socket;
    }
  }

  async send<TData>(
    address: string,
    port: number,
    type: JsonUdpMessageType,
    data?: TData,
    guid?: string,
  ) {
    const msg: JsonUdpMessage = { type };

    if (guid) {
      msg.guid = guid;
    }

    if (data) {
      msg.data = data;
    }

    const msgJson = JSON.stringify(msg);

    try {
      if (!this.socket) {
        await this.connect();
      }

      const bytes = this.aesKey ? aesEncrypt(msgJson, this.aesKey) : msgJson;

      dbgInfo(
        `${this.prefix} - outgoing message to ${address}:${port}\nMessage data: ${msgJson}`,
      );

      return this.socket.send(Buffer.from(bytes, 'binary'), port, address);
    } catch (error) {
      throw `${this.prefix} - failed to send message: ${msgJson}\nreason: ${error}`;
    }
  }

  private responseHandlers: Record<string, JsonUdpMessageCallback> = {};

  async request<TReqData = unknown, TResData = unknown>(
    address: string,
    port: number,
    type: JsonUdpMessageType,
    data?: TReqData,
    guid = uuid(),
    timeout = 10000,
  ) {
    guid ??= uuid();

    return await new Promise<JsonUdpMessage<TResData>>(async (res, rej) => {
      try {
        setTimeout(() => rej('Timed out'), timeout);

        this.responseHandlers[guid] = res as (
          msg: JsonUdpMessage<TResData>,
        ) => void;

        await this.send(address, port, type, data, guid);
      } catch (e) {
        rej(e);
      }
    });
  }

  private subscribers: Record<string, JsonUdpMessageCallback> = {};

  /**
   * @returns A function to unsubscribe.
   */
  async subscribe(callback: JsonUdpMessageCallback) {
    const guid = uuid();

    this.subscribers[guid] = callback;

    return () => {
      delete this.subscribers[guid];
    };
  }
}
