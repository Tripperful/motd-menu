import { Router } from 'express';

export const teamsApi = Router();

teamsApi.post('/set/:steamId?/:teamIndex', async (req, res) => {
  try {
    const { teamIndex, steamId } = req.params;
    const {
      srcdsApi,
      sessionData: { permissions },
    } = res.locals;

    if (steamId && !permissions.includes('teams_others_edit')) {
      return res.status(403).end();
    }

    await srcdsApi.setPlayerTeam(steamId, Number(teamIndex));

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
