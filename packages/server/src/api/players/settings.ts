import { PlayerClientSettings } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const playerSettingsRouter = Router();

playerSettingsRouter.get('/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    res.status(200).end(JSON.stringify(await db.client.settings.get(steamId)));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playerSettingsRouter.post('/', async (req, res) => {
  try {
    const { steamId } = res.locals.sessionData;
    const settings = req.body as PlayerClientSettings;

    await db.client.settings.set(steamId, settings);
    res.locals.srcdsApi.applySettings(steamId, settings);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
