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
  } catch {
    res.status(500).end();
  }
});
