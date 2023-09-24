import { Router } from 'express';

export const menuApi = Router();

menuApi.post('/close', async (_req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { token },
    } = res.locals;

    await srcdsApi.closeMenu(token);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
