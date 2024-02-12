import { OnlinePlayerInfo, Permission, SrcdsProtocol } from '@motd-menu/common';
import { RequestHandler } from 'express';
import { db } from './db';
import { getSrcdsApi } from './srcdsApi';
import { SrcdsApi } from './srcdsApi/SrcdsApi';
import { dbgWarn } from './util';

export interface MotdSessionData {
  protocol: SrcdsProtocol;
  remoteId: string;
  token: string;
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
    const auth = await srcdsApi.auth(token);

    if (!(auth.userId && auth.steamId)) {
      delete authCache[token];

      throw 'Unauthorized';
    }

    authCache[token] = auth;
  }

  return authCache[token];
};

export const dropAuthCache = (token: string) => {
  delete authCache[token];
};

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    if (
      req.url.includes('srcds-mock.html') ||
      req.headers?.referer?.includes('srcds-mock.html')
    ) {
      return next();
    }

    const reqAuthVersion = req.cookies?.version ?? authVersion;
    const cookie = reqAuthVersion === authVersion ? req.cookies : null;
    const token: string = (req.query?.token as string) ?? cookie?.token;
    const remoteId: string = (req.query?.guid as string) ?? cookie?.remoteId;

    if (!(token && remoteId)) {
      dbgWarn(
        `Missing required auth request parameters, request info: ${JSON.stringify(
          {
            reqAuthVersion,
            cookie,
            token,
            remoteId,
            query: req.query,
            url: req.url,
          },
        )}`,
      );

      throw 'Unauthorized';
    }

    const protocol = 'ws';

    const srcdsApi = getSrcdsApi({ protocol, remoteId });
    res.locals.srcdsApi = srcdsApi;

    const { steamId, userId } = await getUserCredentials(token, srcdsApi);
    const permissions = await db.permissions.get(steamId);

    res.locals.sessionData = {
      protocol,
      remoteId,
      token,
      userId,
      steamId,
      permissions,
    };

    res.cookie('version', authVersion);
    res.cookie('protocol', protocol);
    res.cookie('remoteId', remoteId);
    res.cookie('token', token, { httpOnly: true });
    res.cookie('userId', userId);
    res.cookie('steamId', steamId);
    res.cookie('permissions', JSON.stringify(permissions));

    next();
  } catch {
    res.clearCookie('version');
    res.clearCookie('token');
    res.clearCookie('protocol');
    res.clearCookie('remoteId');
    res.clearCookie('userId');
    res.clearCookie('steamId');
    res.clearCookie('permissions');
    res.status(401);
    res.end('Unauthorized');
  }
};
