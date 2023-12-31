import { Router } from 'express';

export const teamsApi = Router();

teamsApi.post('/set/:userId?/:teamIndex', async (req, res) => {
  try {
    const { teamIndex } = req.params;
    const {
      srcdsApi,
      sessionData: { permissions, userId: ownUserId },
    } = res.locals;

    const settingOwnTeam = req.params.userId == null;
    let userId: number;

    if (settingOwnTeam) {
      userId = ownUserId;
    } else {
      if (!permissions.includes('teams_others_edit')) {
        return res.status(403).end();
      }
    }

    await srcdsApi.setPlayerTeam(userId, Number(teamIndex));

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
