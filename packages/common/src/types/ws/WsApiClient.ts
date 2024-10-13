import type {
  WsFetchRequestType,
  WsQueryRequestType,
  WsSendDataActionType,
  WsSignalActionType,
} from './util';
import type { WebSocket } from 'ws';

/**
 * WebSocket API client
 */
export interface WsApiClient<TWsSendSchema = unknown, TClientInfo = unknown> {
  /**
   * Returns the WebSocket connection for this client
   */
  getSocket(): WebSocket;

  /**
   * Returns the ID for this client
   */
  getId(): string;

  /**
   * Returns the client info
   */
  getInfo(): TClientInfo;

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
}
