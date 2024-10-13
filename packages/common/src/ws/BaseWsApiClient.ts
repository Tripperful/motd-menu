/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuid, type WsApiClient } from '@motd-menu/common';
import { WebSocket } from 'ws';

export class BaseWsApiClient<TWsSendSchema, TClientInfo>
  implements WsApiClient<TWsSendSchema, TClientInfo>
{
  private requests: Record<string, (data: any) => void> = {};

  constructor(
    private id: string,
    private socket: WebSocket,
    private info: TClientInfo,
  ) {}

  getSocket(): WebSocket {
    return this.socket;
  }

  getId(): string {
    return this.id;
  }

  getInfo(): TClientInfo {
    return this.info;
  }

  send(type: string, data?: unknown, guid?: string): void {
    const msg = { type, guid, data };

    if (data == null) delete msg.data;
    if (guid == null) delete msg.guid;

    this.socket.send(JSON.stringify(msg));
  }

  request(type: string, data?: unknown) {
    return new Promise<any>((resolve, reject) => {
      const guid = uuid();

      const timeout = setTimeout(() => {
        delete this.requests[guid];
        reject(new Error(`Request ${type} timed out after 10s`));
      }, 10000);

      this.requests[guid] = (response) => {
        clearTimeout(timeout);
        resolve(response.data);
      };

      this.send(type, data, guid);
    });
  }

  /**
   * Send a reply to a request
   *
   * @param type Type of the reply message
   * @param guid UUID of the request
   * @param data Data to send
   */
  sendReply(type: string, guid: string, data?: unknown): void {
    return this.send(type, data, guid);
  }

  /**
   * Handle a response to a request
   *
   * @param guid UUID of the request
   * @param type Type of the response message
   * @param data Data of the response message
   *
   * @returns Whether the response was handled
   */
  handleResponse(type: string, guid: string, data?: unknown): boolean {
    const responseHandler = this.requests[guid];

    if (responseHandler) {
      delete this.requests[guid];
      responseHandler({ type, guid, data });
      return true;
    }

    return false;
  }
}
