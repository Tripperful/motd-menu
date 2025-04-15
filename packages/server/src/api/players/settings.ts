import { PlayerClientSettings, SetSettingsData } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const playerSettingsRouter = Router();

playerSettingsRouter.get('/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    res.status(200).json(await db.client.settings.get(steamId));
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

    const newSettings: SetSettingsData = {
      steamId,
      settings: {
        drawviewmodel: settings.drawViewmodel ? 1 : 0,
        esp: settings.esp ? 1 : 0,
        dsp: settings.dsp ? 1 : 0,
        amb: settings.amb ? 1 : 0,
        bob: settings.bob ? 1 : 0,
        fg: settings.fg ? 1 : 0,
        fov: settings.fov,
        magnumZoomFov: settings.magnumZoomFov,
        crossbowZoomFov: settings.crossbowZoomFov,
        hitsound: settings.hitSound ? 1 : 0,
        killsound: settings.killSound ? 1 : 0,
        kevlarsound: settings.kevlarSound ? 1 : 0,
        hitSoundPaths: settings.hitSoundPaths,
      },
    };

    res.locals.srcds.send('apply_settings', newSettings);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
