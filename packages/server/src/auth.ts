import { OnlinePlayerInfo, Permission } from '@motd-menu/common';
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
}

const authVersion = '1';

const authCache: Record<string, OnlinePlayerInfo> = {};

const getUserCredentials = async (
  token: string,
  srcds?: SrcdsWsApiClientType,
): Promise<OnlinePlayerInfo> => {
  let auth = authCache[token];

  if (!auth?.steamId) {
    auth = { steamId: await db.server.devTokenAuth(token) };
  }

  if (!auth?.steamId) {
    if (!srcds) {
      throw 'Unauthorized';
    }
    auth = await srcds.request('motd_auth_request', token);
  }

  if (!auth?.steamId) {
    delete authCache[token];
    throw 'Unauthorized';
  }

  authCache[token] = auth;
  return authCache[token];
};

export const dropAuthCache = (token: string) => {
  delete authCache[token];
};

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const reqAuthVersion = req.cookies?.version ?? authVersion;
    const cookie = reqAuthVersion === authVersion ? req.cookies : null;
    const token: string = (req.query?.token as string) ?? cookie?.token;
    const remoteId: string = (req.query?.guid as string) ?? cookie?.remoteId;

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

    const { steamId, userId } = await getUserCredentials(token, srcds);
    const permissions = await db.permissions.get(steamId);

    res.locals.sessionData = {
      remoteId,
      token,
      userId,
      steamId,
      permissions,
    };

    const queryAuth = Boolean(req.query?.token);

    if (queryAuth) {
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
