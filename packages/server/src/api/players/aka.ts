import { Router } from 'express';
import { db } from 'src/db';

export const akaRouter = Router();

akaRouter.post('/:steamId/:name', async (req, res) => {
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

akaRouter.delete('/:steamId', async (req, res) => {
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

akaRouter.get('/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    res.status(200).end(await db.client.getAka(steamId));
  } catch {
    res.status(500).end();
  }
});
