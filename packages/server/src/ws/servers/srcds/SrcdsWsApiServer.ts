import type {
  ServerInfo,
  SrcdsWsRecvSchema,
  SrcdsWsSendSchema,
  WsApiServer,
} from '@motd-menu/common';
import { BaseWsApiServer } from '@motd-menu/common';
import type { IncomingMessage } from 'http';
import { db } from 'src/db';

export class SrcdsWsApiServer extends BaseWsApiServer<
  SrcdsWsRecvSchema,
  SrcdsWsSendSchema,
  ServerInfo
> {
  private static instance: SrcdsWsApiServer;

  public async authenticate(req: IncomingMessage) {
    const searchParams = new URL(req.url, `http://${req.headers.host}`)
      ?.searchParams;

    const auth = searchParams?.get('auth')?.toLowerCase();
    const sessionId = searchParams?.get('guid');
    const versionHash = searchParams?.get('ver');
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
