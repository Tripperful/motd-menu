import { BaseWsApiServer, OnlinePlayerInfo } from '@motd-menu/common';
import { parse } from 'cookie';
import { IncomingMessage } from 'http';
import { getMotdUserCredentials } from 'src/auth';
import { SrcdsWsApiServer } from '../srcds/SrcdsWsApiServer';

export class MotdWsApiServer extends BaseWsApiServer<
  unknown,
  unknown,
  OnlinePlayerInfo
> {
  private static instance: MotdWsApiServer;

  private getAuthParams(req: IncomingMessage) {
    const { token, remoteId } = parse(req.headers.cookie || '');

    if (token && remoteId) {
      return { token, remoteId };
    }

    return null;
  }

  public canHandleUpgrade(req: IncomingMessage) {
    return !!this.getAuthParams(req);
  }

  public async authenticate(req: IncomingMessage) {
    const { token, remoteId } = this.getAuthParams(req);
    const srcds = SrcdsWsApiServer.getInstace()
      .getConnectedClients()
      .find((client) => client.getInfo().sessionId === remoteId);

    if (!srcds) return null;

    try {
      const clientInfo = await getMotdUserCredentials(token);

      return {
        clientId: `MOTD (${clientInfo.steamId}) ${token} ${remoteId}`,
        clientInfo,
      };
    } catch {
      return null;
    }
  }

  public static getInstace() {
    this.instance ??= new MotdWsApiServer();

    return this.instance;
  }
}
