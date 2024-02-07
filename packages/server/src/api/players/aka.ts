import { Router } from 'express';
import { db } from 'src/db';

export const akaApi = Router();

akaApi.post('/:steamId/:name', async (req, res) => {
  try {
    if (!res.locals.sessionData.permissions.includes('aka_edit')) {
      return res.status(403).end();
    }

    const { steamId, name } = req.params;

    await db.client.setAka(steamId, name);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});

akaApi.delete('/:steamId', async (req, res) => {
  try {
    if (!res.locals.sessionData.permissions.includes('aka_edit')) {
      return res.status(403).end();
    }

    const { steamId } = req.params;

    await db.client.setAka(steamId, null);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});

akaApi.get('/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    res.status(200).end(await db.client.getAka(steamId));
  } catch {
    res.status(500).end();
  }
});
