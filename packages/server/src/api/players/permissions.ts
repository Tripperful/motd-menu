import { Permission } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const permissionsApi = Router();

permissionsApi.get('/:steamId', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('permissions_view')) {
      res.status(403).end();
      return;
    }

    const { steamId } = req.params;
    const result = (await db.permissions.get(steamId)) ?? [];

    res.status(200).end(JSON.stringify(result));
  } catch {
    res.status(500).end();
  }
});

permissionsApi.post('/:steamId/grant/:permission', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('permissions_edit')) {
      res.status(403).end();
      return;
    }

    const { steamId, permission } = req.params;
    await db.permissions.grant(steamId, permission as Permission);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});

permissionsApi.post('/:steamId/withdraw/:permission', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('permissions_edit')) {
      res.status(403).end();
      return;
    }

    const { steamId, permission } = req.params;
    await db.permissions.withdraw(steamId, permission as Permission);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
