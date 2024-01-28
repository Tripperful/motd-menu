import { Permission, SrcdsProtocol } from '@motd-menu/common';
import { RequestHandler } from 'express';
import { db } from './db';
import { getSrcdsApi } from './srcdsApi';
import { dbgWarn } from './util';

export interface MotdSessionData {
  protocol: SrcdsProtocol;
  ip: string;
  port: number;
  token: string;
  name: string;
  userId: number;
  steamId: string;
  permissions: Permission[];
}

const authVersion = '1';

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const reqAuthVersion = req.cookies.version ?? authVersion;
    const cookie = reqAuthVersion === authVersion ? req.cookies : null;

    const protocol: SrcdsProtocol =
      (req.query?.protocol as string) ?? cookie?.protocol ?? 'rcon';

    const ip: string = (req.query?.ip as string) ?? cookie?.ip;
    const port: number = Number((req.query?.port as string) ?? cookie?.port);
    const token: string = (req.query?.token as string) ?? cookie?.token;

    if (!(ip && port && token)) {
      dbgWarn(`Missing required auth request parameters`);

      throw 'Unauthorized';
    }

    const srcdsApi = getSrcdsApi(protocol, ip, port);
    res.locals.srcdsApi = srcdsApi;

    const { steamId, name, userId } = await srcdsApi.auth(token);

    if (!(name && userId && steamId)) {
      throw 'Unauthorized';
    }

    const permissions = await db.permissions.get(steamId);

    res.locals.sessionData = {
      protocol,
      ip,
      port,
      token,
      name,
      userId,
      steamId,
      permissions,
    };

    res.cookie('version', authVersion);
    res.cookie('token', token, { httpOnly: true });
    res.cookie('protocol', protocol);
    res.cookie('ip', ip);
    res.cookie('port', port);
    res.cookie('name', name);
    res.cookie('userId', userId);
    res.cookie('steamId', steamId);
    res.cookie('permissions', JSON.stringify(permissions));

    next();
  } catch {
    res.clearCookie('version');
    res.clearCookie('token');
    res.clearCookie('protocol');
    res.clearCookie('ip');
    res.clearCookie('port');
    res.clearCookie('name');
    res.clearCookie('userId');
    res.clearCookie('steamId');
    res.clearCookie('permissions');
    res.status(401);
    res.end('Unauthorized');
  }
};
