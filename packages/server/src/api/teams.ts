import { Router } from 'express';

export const teamsRouter = Router();

teamsRouter.post('/set/:userId?/:teamIndex', async (req, res) => {
  try {
    const { teamIndex, userId: userIdStr } = req.params;
    const {
      srcdsApi,
      sessionData: { permissions, userId: ownUserId },
    } = res.locals;

    const settingOwnTeam = userIdStr == null;
    const userId = settingOwnTeam ? ownUserId : Number(userIdStr);

    if (!settingOwnTeam && !permissions.includes('teams_others_edit')) {
      return res.status(403).end();
    }

    srcdsApi.setPlayerTeam(userId, Number(teamIndex));

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
