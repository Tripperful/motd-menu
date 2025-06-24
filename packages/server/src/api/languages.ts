import { Router } from 'express';
import { db } from 'src/db';

export const languagesRouter = Router();

languagesRouter.get('/', async (_req, res) => {
  try {
    const {
      sessionData: { steamId },
    } = res.locals;

    res.json(await db.chat.getPreferredLanguages(steamId)).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

languagesRouter.post('/', async (req, res) => {
  try {
    const {
      sessionData: { steamId },
    } = res.locals;

    const languages = req.body as string[];

    await db.chat.setPreferredLanguages(steamId, languages);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
