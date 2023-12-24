import { Permission } from '@motd-menu/common';
import { RequestHandler } from 'express';
import { db } from './db';
import { getSrcdsApi } from './srcdsApi';

export interface MotdSessionData {
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

    const ip = (req.query?.ip as string) ?? cookie?.ip;
    const port = Number((req.query?.port as string) ?? cookie?.port);
    const token = (req.query?.token as string) ?? cookie?.token;

    if (!(ip && port && token)) {
      throw 'Unauthorized';
    }

    const srcdsApi = getSrcdsApi(ip as string, port);
    res.locals.srcdsApi = srcdsApi;

    const { steamId, name, userId } = await srcdsApi.auth(token);

    if (!(name && userId && steamId)) {
      throw 'Unauthorized';
    }

    const permissions = await db.permissions.get(steamId);

    res.locals.sessionData = {
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
