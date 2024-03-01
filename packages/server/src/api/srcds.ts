import { Router } from 'express';

export const srcdsRouter = Router();

srcdsRouter.post('/runCommand', async (req, res) => {
  try {
    const { command } = req.body;
    const { srcdsApi } = res.locals;

    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('rcon')) {
      return res.status(403).end();
    }

    srcdsApi.runCommand(command);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
