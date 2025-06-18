import { SrcdsWsApiServer } from '../srcds/SrcdsWsApiServer';
import { MotdWsApiServer } from './MotdWsApiServer';

let streamLoopInterval: NodeJS.Timeout;

type MotdWsApiClient = ReturnType<
  ReturnType<typeof MotdWsApiServer.getInstace>['getClient']
>;

export const startStreamLoop = () => {
  if (streamLoopInterval) return;

  streamLoopInterval = setInterval(async () => {
    const clientsByRemoteId: Record<string, MotdWsApiClient[]> = {};

    for (const client of MotdWsApiServer.getInstace().getConnectedClients()) {
      const remoteId = client.getInfo().remoteId;
      clientsByRemoteId[remoteId] ??= [];
      clientsByRemoteId[remoteId].push(client);
    }

    const srcdsWsApiClients =
      SrcdsWsApiServer.getInstace().getConnectedClients();

    for (const remoteId in clientsByRemoteId) {
      const clients = clientsByRemoteId[remoteId];

      const srcdsApi = srcdsWsApiClients.find(
        (c) => c.getInfo().sessionId === remoteId,
      );

      const players = await srcdsApi.request('get_players_request');

      clients.forEach((client) => {
        client.send('stream_frame', { timestamp: Date.now(), players });
      });
    }
  }, 100);
};

export const stopStreamLoop = () => {
  clearInterval(streamLoopInterval);
  streamLoopInterval = null;
};
