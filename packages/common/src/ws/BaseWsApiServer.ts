/* eslint-disable @typescript-eslint/no-explicit-any */

import type { WsApiClient, WsApiServer } from '@motd-menu/common';
import type http from 'http';
import type { Duplex } from 'stream';
import type { WebSocket, WebSocketServer } from 'ws';
import { BaseWsApiClient } from './BaseWsApiClient';

export abstract class BaseWsApiServer<TWsRecvSchema, TWsSendSchema, TClientInfo>
  implements WsApiServer<TWsRecvSchema, TWsSendSchema>
{
  private clients: Record<string, BaseWsApiClient<TWsSendSchema, TClientInfo>> =
    {};
  private subscriptions: Record<string, ((...args: any[]) => Promise<any>)[]> =
    {};

  /**
   * Authenticate a client
   *
   * @param req Incoming HTTP request
   *
   * @returns Client ID if successful, otherwise null
   */
  public abstract authenticate(req: http.IncomingMessage): Promise<{
    clientId: string;
    clientInfo: any;
  }>;

  onUpgrade(
    req: http.IncomingMessage,
    socket: Duplex,
    head: Buffer,
    wsServer: WebSocketServer,
  ): Promise<BaseWsApiClient<TWsSendSchema, TClientInfo>> {
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

        existingClient.getSocket().close();
        delete this.clients[clientId];
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Client ${clientId} did not connect in time`));
      }, 5000);

      wsServer.handleUpgrade(req, socket, head, async (clientWs) => {
        try {
          const client = new BaseWsApiClient<TWsSendSchema, TClientInfo>(
            clientId,
            clientWs,
            clientInfo,
          );

          this.clients[clientId] = client;

          clientWs.on('close', () => {
            delete this.clients[clientId];
          });

          clientWs.on('message', (msg) => {
            try {
              const message = JSON.parse(msg.toString());
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
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  getClient(
    clientIdOrWs: string | WebSocket,
  ): WsApiClient<TWsSendSchema, TClientInfo> {
    return typeof clientIdOrWs === 'string'
      ? this.clients[clientIdOrWs]
      : this.getConnectedClients().find(
          (client) => client.getSocket() === clientIdOrWs,
        );
  }

  getConnectedClients(): WsApiClient<TWsSendSchema, TClientInfo>[] {
    return Object.values(this.clients);
  }

  onMessage(type: string, callback: unknown): () => void {
    this.subscriptions[type] = this.subscriptions[type] ?? [];
    this.subscriptions[type].push(callback as any);

    return () => {
      this.subscriptions[type] = this.subscriptions[type].filter(
        (cb) => cb !== callback,
      );
    };
  }

  onRequest(type: string, callback: unknown): () => void {
    return this.onMessage(type, callback);
  }
}
