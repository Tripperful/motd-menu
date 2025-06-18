import { ClientSettingsValues } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { SrcdsWsApiClient } from 'src/ws/servers/srcds/SrcdsWsApiClient';

export const playerSettingsRouter = Router();

const getSrcdsClientSettingsMetadata = async (srcds: SrcdsWsApiClient) =>
  srcds?.settingsMetadata
    ? srcds.settingsMetadata
    : await db.client.settings.getMetadata();

playerSettingsRouter.get('/metadata', async (req, res) => {
  try {
    const { srcds } = res.locals;

    res.status(200).json(await getSrcdsClientSettingsMetadata(srcds));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playerSettingsRouter.get('/values/:steamId', async (req, res) => {
  try {
    const { srcds } = res.locals;
    const { steamId } = req.params;

    const [metadata, values] = await Promise.all([
      getSrcdsClientSettingsMetadata(srcds),
      db.client.settings.getValues(steamId),
    ]);

    for (const setting of Object.keys(values)) {
      if (!metadata[setting]) {
        delete values[setting];
      }
      values[setting] ??= metadata[setting]?.defaultValue;
    }

    for (const setting of Object.keys(metadata)) {
      if (values[setting] == null) {
        values[setting] = metadata[setting].defaultValue;
      }
    }

    res.status(200).json(values);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playerSettingsRouter.post('/values', async (req, res) => {
  try {
    const { steamId } = res.locals.sessionData;
    const settings = req.body as ClientSettingsValues;

    await db.client.settings.setValues(steamId, settings);

    res.locals.srcds.send('set_client_settings', {
      steamId,
      settings,
    });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
