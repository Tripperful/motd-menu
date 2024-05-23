import { Router } from 'express';

export const menuRouter = Router();

menuRouter.post('/close', async (_req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { token },
    } = res.locals;

    srcdsApi.closeMenu(token);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

menuRouter.get('/tgLink', async (_req, res) => {
  try {
    const {
      tgService,
      sessionData: { steamId },
    } = res.locals;

    const link = (await tgService?.getJoinLink(steamId)) ?? null;

    res.json({ link });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
