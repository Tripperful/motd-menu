import { OnlinePlayerInfo, Permission, SrcdsProtocol } from '@motd-menu/common';
import { RequestHandler } from 'express';
import { db } from './db';
import { getSrcdsApi } from './srcdsApi';
import { SrcdsApi } from './srcdsApi/SrcdsApi';
import { dbgWarn } from './util';

export interface MotdSessionData {
  protocol: SrcdsProtocol;
  ip: string;
  port: number;
  remoteId: string;
  token: string;
  name: string;
  userId: number;
  steamId: string;
  permissions: Permission[];
}

const authVersion = '1';

const authCache: Record<string, OnlinePlayerInfo> = {};

const getUserCredentials = async (
  token: string,
  srcdsApi: SrcdsApi,
): Promise<OnlinePlayerInfo> => {
  if (!authCache[token]) {
    authCache[token] = await srcdsApi.auth(token);
  }

  return authCache[token];
};

export const dropAuthCache = (token: string) => {
  delete authCache[token];
};

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const reqAuthVersion = req.cookies.version ?? authVersion;
    const cookie = reqAuthVersion === authVersion ? req.cookies : null;

    const ip: string = (req.query?.ip as string) ?? cookie?.ip;
    const port: number = Number((req.query?.port as string) ?? cookie?.port);
    const token: string = (req.query?.token as string) ?? cookie?.token;
    const remoteId: string = (req.query?.guid as string) ?? cookie?.remoteId;

    if (!(token && ((ip && port) || remoteId))) {
      dbgWarn(`Missing required auth request parameters`);

      throw 'Unauthorized';
    }

    const protocol = remoteId ? 'ws' : 'rcon';

    const srcdsApi = getSrcdsApi({ protocol, ip, port, remoteId });
    res.locals.srcdsApi = srcdsApi;

    const { steamId, name, userId } = await getUserCredentials(token, srcdsApi);

    if (!(name && userId && steamId)) {
      throw 'Unauthorized';
    }

    const permissions = await db.permissions.get(steamId);

    res.locals.sessionData = {
      protocol,
      ip,
      port,
      remoteId,
      token,
      name,
      userId,
      steamId,
      permissions,
    };

    res.cookie('version', authVersion);
    res.cookie('protocol', protocol);

    if (remoteId) {
      res.cookie('remoteId', remoteId);
      res.clearCookie('ip');
    } else {
      res.cookie('ip', ip);
      res.cookie('port', port);
      res.clearCookie('remoteId');
    }

    res.cookie('token', token, { httpOnly: true });
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
    res.clearCookie('remoteId');
    res.clearCookie('name');
    res.clearCookie('userId');
    res.clearCookie('steamId');
    res.clearCookie('permissions');
    res.status(401);
    res.end('Unauthorized');
  }
};
