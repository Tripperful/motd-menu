import { StartMatchSettings } from '@motd-menu/common';
import { Router } from 'express';

export const matchApi = Router();

matchApi.post('/start', async (req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { token, permissions },
    } = res.locals;

    if (!permissions.includes('match_organizer')) return res.status(403).end();

    try {
      await srcdsApi.startMatch(token, req.body as StartMatchSettings);
    } catch (e) {
      return res
        .status(400)
        .end(typeof e === 'string' ? e : 'Failed to start a match');
    }

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
