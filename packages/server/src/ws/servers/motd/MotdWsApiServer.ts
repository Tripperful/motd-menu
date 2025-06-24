import {
  BaseWsApiClient,
  BaseWsApiServer,
  MotdWsSendSchema,
  OnlinePlayerInfo,
} from '@motd-menu/common';
import { parse } from 'cookie';
import { IncomingMessage } from 'http';
import { getMotdUserCredentials } from 'src/auth';
import { WebSocket } from 'ws';
import { SrcdsWsApiServer } from '../srcds/SrcdsWsApiServer';
import { startStreamLoop } from './stream';

export interface MotdClientInfo extends OnlinePlayerInfo {
  remoteId: string;
}

export class MotdWsApiServer extends BaseWsApiServer<
  unknown,
  MotdWsSendSchema,
  MotdClientInfo
> {
  private static instance: MotdWsApiServer;

  constructor() {
    super();
    startStreamLoop();
  }

  private getAuthParams(req: IncomingMessage) {
    const cookie = parse(req.headers.cookie || '');
    const searchParams = new URL(req.url, `http://${req.headers.host}`)
      ?.searchParams;

    const token = cookie.token ?? searchParams?.get('token');
    const remoteId = cookie.remoteId ?? searchParams?.get('guid');

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
      const clientInfo: MotdClientInfo = {
        ...(await getMotdUserCredentials(token, req)),
        remoteId,
      };

      return {
        clientId: `MOTD (${clientInfo.steamId}) ${token} ${remoteId}`,
        clientInfo,
      };
    } catch {
      return null;
    }
  }

  protected override clientFactory(
    clientId: string,
    clientWs: WebSocket,
    clientInfo: MotdClientInfo,
  ) {
    return new BaseWsApiClient<MotdWsSendSchema, MotdClientInfo>(
      clientId,
      clientWs,
      clientInfo,
    );
  }

  public static getInstace() {
    this.instance ??= new MotdWsApiServer();

    return this.instance;
  }
}
