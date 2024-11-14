import { Permission } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const permissionsRouter = Router();

permissionsRouter.get('/:steamId', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('permissions_view')) {
      res.status(403).end();
      return;
    }

    const { steamId } = req.params;
    const result = (await db.permissions.get(steamId)) ?? [];

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

permissionsRouter.post('/:steamId/grant/:permission', async (req, res) => {
  try {
    const { permissions, steamId: mySteamId } = res.locals.sessionData;

    if (!permissions.includes('permissions_edit')) {
      res.status(403).end();
      return;
    }

    const { steamId, permission } = req.params;
    await db.permissions.grant(steamId, permission as Permission);

    db.logs.add('menu_change_player_permissions', mySteamId, {
      steamId,
      action: 'grant',
      permission,
    });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

permissionsRouter.post('/:steamId/withdraw/:permission', async (req, res) => {
  try {
    const { permissions, steamId: mySteamId } = res.locals.sessionData;

    if (!permissions.includes('permissions_edit')) {
      res.status(403).end();
      return;
    }

    const { steamId, permission } = req.params;
    await db.permissions.withdraw(steamId, permission as Permission);

    db.logs.add('menu_change_player_permissions', mySteamId, {
      steamId,
      action: 'withdraw',
      permission,
    });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
