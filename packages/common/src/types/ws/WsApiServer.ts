import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import type { WebSocketServer } from 'ws';
import type {
  WsFetchRequestType,
  WsQueryRequestType,
  WsResponsePayloadType,
  WsSendDataActionType,
  WsSignalActionType,
} from './util';
import type { WsApiClient } from './WsApiClient';
import { WsClient } from './WsClient';

/**
 * WebSocket API server
 */
export interface WsApiServer<
  TWsRecvSchema = unknown,
  TWsSendSchema = unknown,
  TClientInfo = unknown,
> {
  /**
   * Check if this server is supposed to handle this type of upgrade request
   */
  canHandleUpgrade(req: IncomingMessage): boolean;

  /**
   * Authenticate a client
   *
   * @param req Incoming HTTP request
   *
   * @returns Client ID if successful, otherwise null
   */
  authenticate(req: IncomingMessage): Promise<{
    clientId: string;
    clientInfo: TClientInfo;
  }>;

  /**
   * Authenticate a client and connect them if successful
   */
  onUpgrade(
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
    wsServer: WebSocketServer,
  ): Promise<WsApiClient<TWsSendSchema, TClientInfo>>;

  /**
   * Returns a client by their WebSocket connection
   *
   * @param clientWs Client WebSocket connection
   */
  getClient(clientWs: WsClient): WsApiClient<TWsSendSchema, TClientInfo>;

  /**
   * Returns a client by their ID
   *
   * @param clientId Client ID
   */
  getClient(clientId: string): WsApiClient<TWsSendSchema, TClientInfo>;

  /**
   * Get all connected clients
   */
  getConnectedClients(): WsApiClient<TWsSendSchema, TClientInfo>[];

  /**
   * Subscribe to a data message type
   *
   * @param type Message type
   * @param callback Callback function with the client that sent the message and received data
   * @returns A function to unsubscribe
   */
  onMessage<TAction extends WsSendDataActionType<TWsRecvSchema>>(
    type: TAction,
    callback: (
      client: WsApiClient<TWsSendSchema, TClientInfo>,
      data: 'reqData' extends keyof TWsRecvSchema[TAction]
        ? TWsRecvSchema[TAction]['reqData']
        : never,
    ) => void,
  ): () => void;

  /**
   * Subscribe to a signal-type message
   *
   * @param type Message type
   * @param callback Callback function with the client that sent
   * the message
   *
   * @returns A function to unsubscribe
   */
  onMessage<TAction extends WsSignalActionType<TWsRecvSchema>>(
    type: TAction,
    callback: (client: WsApiClient<TWsSendSchema, TClientInfo>) => void,
  ): () => void;

  /**
   * Subscribe to a fetch-type request
   *
   * @param type Request type
   * @param callback Callback function with the client that
   * sent the request, sends returned value (if any) as response
   *
   * @returns A function to unsubscribe
   */
  onRequest<TReqest extends WsFetchRequestType<TWsRecvSchema>>(
    type: TReqest,
    callback: (
      client: WsApiClient<TWsSendSchema, TClientInfo>,
    ) => Promise<WsResponsePayloadType<TWsRecvSchema, TReqest>>,
  ): () => void;

  /**
   * Subscribe to a query-type request
   *
   * @param type Request type
   * @param callback Callback function with the client that
   * sent the request and the received data, sends returned value
   * (if any) as response
   *
   * @returns A function to unsubscribe
   */
  onRequest<TReqest extends WsQueryRequestType<TWsRecvSchema>>(
    type: TReqest,
    callback: (
      client: WsApiClient<TWsSendSchema, TClientInfo>,
      data: 'reqData' extends keyof TWsRecvSchema[TReqest]
        ? TWsRecvSchema[TReqest]['reqData']
        : never,
    ) => Promise<WsResponsePayloadType<TWsRecvSchema, TReqest>>,
  ): () => void;
}
