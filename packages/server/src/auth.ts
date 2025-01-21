import { OnlinePlayerInfo, Permission } from '@motd-menu/common';
import type { Request } from 'express';
import { RequestHandler } from 'express';
import { db } from './db';
import { dbgWarn, logDbgInfo } from './util';
import {
  SrcdsWsApiClientType,
  SrcdsWsApiServer,
} from './ws/servers/srcds/SrcdsWsApiServer';

export interface MotdSessionData {
  remoteId: string;
  token: string;
  steamId: string;
  userId?: number;
  permissions: Permission[];
  volume?: number;
}

interface AuthCacheEntry {
  ts: number;
  auth: OnlinePlayerInfo;
}

const authVersion = '1';
const authCacheLifetime = 1000 * 60 * 60; // 1 hour
const authCache: Record<string, AuthCacheEntry> = {};

export const getMotdUserCredentials = async (
  token: string,
  srcds?: SrcdsWsApiClientType,
): Promise<OnlinePlayerInfo> => {
  try {
    const tokenAuthCache = authCache[token];

    if (tokenAuthCache) {
      if (Date.now() - tokenAuthCache.ts < authCacheLifetime) {
        return tokenAuthCache.auth;
      } else {
        delete authCache[token];
      }
    }

    const devTokenAuth: OnlinePlayerInfo = {
      steamId: await db.server.devTokenAuth(token),
    };

    if (devTokenAuth?.steamId) {
      authCache[token] = { ts: Date.now(), auth: devTokenAuth };
      return devTokenAuth;
    }

    const srcdsAuth = await srcds.request('motd_auth_request', token);

    if (srcdsAuth?.steamId) {
      authCache[token] = { ts: Date.now(), auth: srcdsAuth };
      return srcdsAuth;
    }
  } catch {
    delete authCache[token];
    throw 'Unauthorized';
  }

  return null;
};

export const dropAuthCache = (token: string) => {
  delete authCache[token];
};

const getReqQueryParams = (req: Request) => {
  const reqQuery = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const refererQuery = new URL(req.headers.referer).searchParams;
  const query = reqQuery.get('token') ? reqQuery : refererQuery;

  return {
    token: query.get('token'),
    remoteId: query.get('guid'),
  };
};

const getMotdReqAuthParams = (req: Request) => {
  const query = getReqQueryParams(req);

  const reqAuthVersion = req.cookies?.version ?? authVersion;
  const cookie = reqAuthVersion === authVersion ? req.cookies : null;
  const token: string = query.token ?? cookie?.token;
  const remoteId: string = query.remoteId ?? cookie?.remoteId;

  return {
    reqAuthVersion,
    cookie,
    token,
    remoteId,
    isQueryAuth: !!query.token,
  };
};

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const { reqAuthVersion, cookie, token, remoteId, isQueryAuth } =
      getMotdReqAuthParams(req);

    if (!token) {
      dbgWarn(
        `Missing auth token, request info: ${JSON.stringify({
          reqAuthVersion,
          cookie,
          token,
          remoteId,
          query: req.query,
          url: req.url,
        })}`,
      );

      throw 'Unauthorized';
    }

    const connectedServers =
      SrcdsWsApiServer.getInstace().getConnectedClients();

    const srcds =
      remoteId &&
      connectedServers?.find((s) => s.getInfo()?.sessionId === remoteId);

    if (srcds) {
      res.locals.srcds = srcds;
    }

    const { steamId, userId } = await getMotdUserCredentials(token, srcds);
    const permissions = await db.permissions.get(steamId);
    const storedVolume = await db.client.getLastSavedCvar(steamId, 'volume');
    const volume = storedVolume ? Number(storedVolume) : 1;

    res.locals.sessionData = {
      remoteId,
      token,
      userId,
      steamId,
      permissions,
      volume,
    };

    if (isQueryAuth) {
      res.cookie('version', authVersion);
      res.cookie('token', token, { httpOnly: true });
      res.cookie('steamId', steamId);
      res.cookie('sendLogs', JSON.stringify(logDbgInfo));

      if (remoteId) {
        res.cookie('remoteId', remoteId);
      } else {
        res.clearCookie('remoteId');
      }

      if (userId) {
        res.cookie('userId', userId);
      } else {
        res.clearCookie('userId');
      }

      res.cookie('permissions', JSON.stringify(permissions));
      res.cookie('volume', volume.toString());
    }

    next();
  } catch {
    res.clearCookie('version');
    res.clearCookie('token');
    res.clearCookie('remoteId');
    res.clearCookie('userId');
    res.clearCookie('steamId');
    res.clearCookie('permissions');
    res.status(401);
    res.end('Unauthorized');
  }
};
