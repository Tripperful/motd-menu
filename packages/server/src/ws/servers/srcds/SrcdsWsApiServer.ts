import type {
  ServerInfo,
  SrcdsWsRecvSchema,
  SrcdsWsSendSchema,
} from '@motd-menu/common';
import { BaseWsApiServer, chatColor } from '@motd-menu/common';
import type { IncomingMessage } from 'http';
import { db } from 'src/db';
import {
  onlinePlayersGauge,
  onlineServersGauge,
  wsMessagesCounter,
} from 'src/metrics';
import { dbgErr } from 'src/util';
import { WebSocket } from 'ws';
import { SrcdsWsApiClient } from './SrcdsWsApiClient';

export class SrcdsWsApiServer extends BaseWsApiServer<
  SrcdsWsRecvSchema,
  SrcdsWsSendSchema,
  ServerInfo,
  SrcdsWsApiClient
> {
  private static instance: SrcdsWsApiServer;

  private getAuthParams(req: IncomingMessage) {
    const searchParams = new URL(req.url, `http://${req.headers.host}`)
      ?.searchParams;

    const auth = searchParams?.get('auth')?.toLowerCase();
    const sessionId = searchParams?.get('guid');
    const version = searchParams?.get('ver');

    if (auth && sessionId) {
      return { auth, sessionId, version };
    }

    return null;
  }

  public canHandleUpgrade(req: IncomingMessage) {
    return !!this.getAuthParams(req);
  }

  public async authenticate(req: IncomingMessage) {
    const { auth, sessionId, version } = this.getAuthParams(req);
    const ip = req.socket.remoteAddress.split(':').pop();
    const port = req.socket.remotePort;

    const serverInfo = await db.server.getByApiKey(auth);

    if (!serverInfo || serverInfo.blocked) return null;
    serverInfo.ip = ip;
    serverInfo.port = port;
    serverInfo.sessionId = sessionId;
    serverInfo.version = version;

    return {
      clientId: `SRCDS (${serverInfo.id}) ${serverInfo.name}`,
      clientInfo: serverInfo,
    };
  }

  protected override clientFactory(
    clientId: string,
    clientWs: WebSocket,
    clientInfo: ServerInfo,
  ) {
    return new SrcdsWsApiClient(clientId, clientWs, clientInfo);
  }

  override onDataReceived(client: SrcdsWsApiClient, data: any): void {
    const type = data.type ?? 'unknown';

    wsMessagesCounter.inc({
      direction: 'incoming',
      type,
      server: client.getInfo().name ?? 'unknown',
    });

    if (type === 'get_players_response') {
      const count = (data.data?.length as number) ?? 0;

      if (count != null) {
        onlinePlayersGauge.set(
          {
            server: client.getInfo().name ?? 'unknown',
          },
          count,
        );
      }
    }
  }

  protected override async onClientConnected(client: SrcdsWsApiClient) {
    onlineServersGauge.set(this.getConnectedClients().length);
    try {
      client
        .request('get_client_settings_metadata_request')
        .then((settingsMetadata) => {
          db.client.settings.upsertMetadata(settingsMetadata);
          client.settingsMetadata = settingsMetadata;
        })
        .catch(dbgErr);

      const onlinePlayers = await client.request('get_players_request');
      const playersPermissions = Object.fromEntries(
        await Promise.all(
          onlinePlayers.map(
            async (player) =>
              [
                player.steamId,
                await db.permissions.get(player.steamId),
              ] as const,
          ),
        ),
      );

      const devsSteamIds = onlinePlayers
        .filter((player) => playersPermissions[player.steamId].includes('dev'))
        .map((player) => player.steamId);

      if (devsSteamIds.length > 0) {
        client.send('chat_print', {
          clients: devsSteamIds,
          text: `${chatColor.MOTD}[MOTD] ${chatColor.Allow}Connected`,
        });
      }
    } catch {}
  }

  protected override async onClientDisconnected(client: SrcdsWsApiClient) {
    onlineServersGauge.set(this.getConnectedClients().length);
  }

  public static getInstace() {
    this.instance ??= new SrcdsWsApiServer();

    return this.instance;
  }
}
