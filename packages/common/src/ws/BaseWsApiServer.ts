/* eslint-disable @typescript-eslint/no-explicit-any */

import { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import type { WebSocket, WebSocketServer } from 'ws';
import { IWebSocket } from '../types/ws';
import {
  WsFetchRequestType,
  WsQueryRequestType,
  WsResponsePayloadType,
  WsSendDataActionType,
  WsSignalActionType,
} from '../types/ws/util';
import { BaseWsApiClient } from './BaseWsApiClient';

export abstract class BaseWsApiServer<
  TWsRecvSchema,
  TWsSendSchema,
  TClientInfo,
  TClient extends BaseWsApiClient<TWsSendSchema, TClientInfo> = BaseWsApiClient<
    TWsSendSchema,
    TClientInfo
  >,
> {
  private clients: Record<string, TClient> = {};
  private subscriptions: Record<string, ((...args: any[]) => Promise<any>)[]> =
    {};
  private static wsApiServers: BaseWsApiServer<any, any, any, any>[] = [];

  /**
   * Check if this server is supposed to handle this type of upgrade request
   */
  abstract canHandleUpgrade(req: IncomingMessage): boolean;

  /**
   * Authenticate a client
   *
   * @param req Incoming HTTP request
   *
   * @returns Client ID if successful, otherwise null
   */
  abstract authenticate(req: IncomingMessage): Promise<{
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
  ): Promise<TClient> {
    return new Promise(async (resolve, reject) => {
      const auth = await this.authenticate(req);

      if (!auth) {
        return resolve(null);
      }

      const { clientId, clientInfo } = auth;

      const existingClient = this.getClient(clientId);

      if (existingClient) {
        console.warn(
          `Duplicate connection from WS client ${clientId}, dropping the old connection`,
        );

        existingClient.getSocket().terminate();
        delete this.clients[clientId];
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Client ${clientId} did not connect in time`));
      }, 5000);

      wsServer.handleUpgrade(req, socket, head, async (clientWs) => {
        try {
          const client = this.clientFactory(clientId, clientWs, clientInfo);

          this.clients[clientId] = client;

          clientWs.on('error', (e) => {
            console.error(`WS client ${clientId} errored, disconnecting:`, e);
            clientWs.terminate();
          });

          clientWs.on('close', () => {
            delete this.clients[clientId];
            this.onClientDisconnected(client);
          });

          clientWs.on('message', (msg) => {
            try {
              const message = JSON.parse(msg.toString());

              this.onDataReceived(client, message);

              const { type, guid, data } = message;

              // If the message is a response to a request, handle it and return
              if (client.handleResponse(type, guid, data)) return;

              const subscribers = this.subscriptions[type] ?? [];

              subscribers.forEach(async (subscriber) => {
                try {
                  const res = await subscriber(client, message.data);

                  if (res) {
                    client.sendReply(res.type, guid, res.data);
                  }
                } catch (e) {
                  console.error(e);
                }
              });
            } catch (e) {
              console.error(e);
            }
          });

          wsServer.emit('connection', clientWs, req);

          clearTimeout(timeout);
          resolve(client);

          this.onClientConnected(client);
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  /**
   * Returns a client by their WebSocket connection
   *
   * @param clientWs Client WebSocket connection
   */
  getClient(clientWs: IWebSocket): TClient;

  /**
   * Returns a client by their ID
   *
   * @param clientId Client ID
   */
  getClient(clientId: string): TClient;

  getClient(clientIdOrWs: string | IWebSocket): TClient {
    return typeof clientIdOrWs === 'string'
      ? this.clients[clientIdOrWs]
      : this.getConnectedClients().find(
          (client) => client.getSocket() === clientIdOrWs,
        );
  }

  /**
   * Get all connected clients
   */
  getConnectedClients(): TClient[] {
    return Object.values(this.clients);
  }

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
      client: TClient,
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
    callback: (client: TClient) => void,
  ): () => void;

  onMessage(type: any, callback: any): () => void {
    this.subscriptions[type] = this.subscriptions[type] ?? [];
    this.subscriptions[type].push(callback);

    return () => {
      this.subscriptions[type] = this.subscriptions[type].filter(
        (cb) => cb !== callback,
      );
    };
  }

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
      client: TClient,
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
      client: TClient,
      data: 'reqData' extends keyof TWsRecvSchema[TReqest]
        ? TWsRecvSchema[TReqest]['reqData']
        : never,
    ) => Promise<WsResponsePayloadType<TWsRecvSchema, TReqest>>,
  ): () => void;

  onRequest(type: any, callback: any): () => void {
    return this.onMessage(type, callback);
  }

  public static registerWsApiServer<
    TServer extends BaseWsApiServer<any, any, any, any>,
  >(wsApiServer: TServer) {
    this.wsApiServers.push(wsApiServer);
  }

  public static getRegisteredWsApiServers() {
    return this.wsApiServers;
  }

  /**
   * Factory method to create a new client instance.
   *
   * @param clientId Client ID
   * @param clientWs Client WebSocket connection
   * @param clientInfo Client information
   */
  protected abstract clientFactory(
    clientId: string,
    clientWs: WebSocket,
    clientInfo: TClientInfo,
  ): TClient;

  /**
   * Override this method to handle data received from the client.
   *
   * @param client The client that sent the data
   * @param data The data received from the client
   */
  public onDataReceived(client: TClient, data: any): void {}

  protected async onClientConnected(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    client: TClient,
  ) {}

  protected async onClientDisconnected(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    client: TClient,
  ) {}
}
