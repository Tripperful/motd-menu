import {
  WsMessage,
  WsMessageCallback,
  WsMessageType,
  WsSubscriberCallback,
} from '@motd-menu/common/src/types/ws';
import { uuid } from '@motd-menu/common/src/util/uuid';

export class WsClient {
  private socket: WebSocket;
  private responseHandlers: Record<string, WsMessageCallback>;
  private subscribers: Record<string, WsSubscriberCallback>;
  private isOpen = false;

  constructor(private url: string) {
    this.connect();
  }

  public connect() {
    try {
      this.subscribers = {};
      this.responseHandlers = {};
      this.socket = new WebSocket(this.url);

      this.socket.addEventListener('message', (e) => {
        this.onWsMessage(e.data);
      });

      this.socket.addEventListener('error', () => this.socket.close());

      this.socket.addEventListener('close', () => {
        if (this.isOpen) {
          console.warn(
            `WebSocket (${this.url}) was closed, reconnecting in 5 seconds...`,
          );

          setTimeout(() => {
            this.connect();
          }, 5000);
        } else {
          console.log(`WebSocket (${this.url}) was closed`);
        }
      });

      this.isOpen = true;
    } catch {
      this.isOpen = false;
    }
  }

  public disconnect() {
    this.isOpen = false;
    this.socket.close();
  }

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

  send<TData>(type: WsMessageType, data?: TData, guid?: string) {
    const msg: WsMessage = { type };

    if (guid) {
      msg.guid = guid;
    }

    if (data) {
      msg.data = data;
    }

    this.socket.send(JSON.stringify(msg));
  }

  public async request<TReqData = unknown, TResData = unknown>(
    type: WsMessageType,
    data?: TReqData,
    timeout = 10000,
  ) {
    return await new Promise<WsMessage<TResData>>(async (res, rej) => {
      try {
        setTimeout(() => rej('Timed out'), timeout);

        const guid = uuid();

        this.responseHandlers[guid] = res as (msg: WsMessage<TResData>) => void;

        this.send(type, data, guid);
      } catch (e) {
        rej(e);
      }
    });
  }

  private onWsMessage(data: string) {
    const msg = JSON.parse(data) as WsMessage;
    const msgType = msg.type;

    if (!msgType) {
      throw new Error('Incoming WS message without type: ' + data);
    }

    const responseCallback = this.responseHandlers[msg.guid];

    if (responseCallback) {
      delete this.responseHandlers[msg.guid];

      try {
        responseCallback(msg);
      } catch {
        console.warn(
          `Error in WS request callback: ${JSON.stringify({
            msg,
          })}`,
        );
      }
    } else {
      for (const [subId, callback] of Object.entries(this.subscribers)) {
        const subMsgType = subId.split(' ')[0];

        if (subMsgType === msg.type) {
          try {
            const responsePromise = callback(msg);

            if (responsePromise) {
              responsePromise.then((res) => {
                if (res) {
                  this.send(res.type, res.data, msg.guid);
                }
              });
            }
          } catch {
            console.warn(
              `Error in WS subscriber callback: ${JSON.stringify({
                msg,
              })}`,
            );
          }
        }
      }
    }
  }
}
