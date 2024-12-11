import type {
  ServerInfo,
  SrcdsWsRecvSchema,
  SrcdsWsSendSchema,
  WsApiServer,
} from '@motd-menu/common';
import { BaseWsApiServer } from '@motd-menu/common';
import type { IncomingMessage } from 'http';
import { db } from 'src/db';
import { chatColor } from 'src/util';

export class SrcdsWsApiServer extends BaseWsApiServer<
  SrcdsWsRecvSchema,
  SrcdsWsSendSchema,
  ServerInfo
> {
  private static instance: SrcdsWsApiServer;

  private getAuthParams(req: IncomingMessage) {
    const searchParams = new URL(req.url, `http://${req.headers.host}`)
      ?.searchParams;

    const auth = searchParams?.get('auth')?.toLowerCase();
    const sessionId = searchParams?.get('guid');
    const versionHash = searchParams?.get('ver');

    if (auth && sessionId) {
      return { auth, sessionId, versionHash };
    }

    return null;
  }

  public canHandleUpgrade(req: IncomingMessage) {
    return !!this.getAuthParams(req);
  }

  public async authenticate(req: IncomingMessage) {
    const { auth, sessionId, versionHash } = this.getAuthParams(req);
    const ip = req.socket.remoteAddress.split(':').pop();
    const port = req.socket.remotePort;

    const serverInfo = await db.server.getByApiKey(auth);

    if (!serverInfo || serverInfo.blocked) return null;
    serverInfo.ip = ip;
    serverInfo.port = port;
    serverInfo.sessionId = sessionId;
    serverInfo.versionHash = versionHash;

    return {
      clientId: `SRCDS (${serverInfo.id}) ${serverInfo.name}`,
      clientInfo: serverInfo,
    };
  }

  protected override async onClientConnected(client: SrcdsWsApiClientType) {
    try {
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

  public static getInstace() {
    this.instance ??= new SrcdsWsApiServer();

    return this.instance as WsApiServer<
      SrcdsWsRecvSchema,
      SrcdsWsSendSchema,
      ServerInfo
    >;
  }
}

export type SrcdsWsApiClientType = ReturnType<
  typeof SrcdsWsApiServer.prototype.getClient
>;
