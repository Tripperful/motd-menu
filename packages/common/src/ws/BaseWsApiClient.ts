/* eslint-disable @typescript-eslint/no-explicit-any */
import { IWebSocket } from '../types/ws';
import {
  WsFetchRequestType,
  WsQueryRequestType,
  WsSendDataActionType,
  WsSignalActionType,
} from '../types/ws/util';
import { uuid } from '../util/uuid';

export class BaseWsApiClient<TWsSendSchema, TClientInfo> {
  private requests: Record<string, (data: any) => void> = {};
  private connectedTimestamp = Date.now();

  constructor(
    private id: string,
    private socket: IWebSocket,
    private info: TClientInfo,
  ) {}

  /**
   * Returns the WebSocket connection for this client
   */
  getSocket(): IWebSocket {
    return this.socket;
  }

  /**
   * Returns the ID for this client
   */
  getId(): string {
    return this.id;
  }

  /**
   * Returns the client info
   */
  getInfo(): TClientInfo {
    return this.info;
  }

  /**
   * Returns the duration in milliseconds this client has been connected
   */
  getConnectedDuration(): number {
    return Date.now() - this.connectedTimestamp;
  }

  /**
   * Send a signal message
   *
   * @param type Message type
   */
  send<TAction extends WsSignalActionType<TWsSendSchema>>(type: TAction): void;

  /**
   * Send a data message
   *
   * @param type Message type
   * @param data Data to send
   */
  send<TAction extends WsSendDataActionType<TWsSendSchema>>(
    type: TAction,
    data: 'reqData' extends keyof TWsSendSchema[TAction]
      ? TWsSendSchema[TAction]['reqData']
      : never,
  ): void;

  send(type: string, data?: unknown): void {
    this.wsSend(type, data);
  }

  private wsSend(type: string, data?: unknown, guid?: string) {
    const msg = { type, guid, data };

    if (data == null) delete msg.data;
    if (guid == null) delete msg.guid;

    this.socket.send(JSON.stringify(msg));
    this.onDataSent(msg);
  }

  /**
   * Make a fetch-type request
   *
   * @param type Message type
   *
   * @returns The response
   */
  request<TReqest extends WsFetchRequestType<TWsSendSchema>>(
    type: TReqest,
  ): Promise<
    'resData' extends keyof TWsSendSchema[TReqest]
      ? TWsSendSchema[TReqest]['resData']
      : void
  >;

  /**
   * Make a query-type request
   *
   * @param type Message type
   * @param data Data to send
   *
   * @returns The response
   */
  request<TReqest extends WsQueryRequestType<TWsSendSchema>>(
    type: TReqest,
    data: 'reqData' extends keyof TWsSendSchema[TReqest]
      ? TWsSendSchema[TReqest]['reqData']
      : never,
  ): Promise<
    'resData' extends keyof TWsSendSchema[TReqest]
      ? TWsSendSchema[TReqest]['resData']
      : void
  >;

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

      this.wsSend(type, data, guid);
    });
  }

  /**
   * Override this method to handle data sent to the client.
   * @param data Data that was sent
   */
  onDataSent(data: any): void {}

  /**
   * Send a reply to a request
   *
   * @param type Type of the reply message
   * @param guid UUID of the request
   * @param data Data to send
   */
  sendReply(type: string, guid: string, data?: unknown): void {
    this.wsSend(type, data, guid);
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
