import { Router } from 'express';
import { db } from 'src/db';

export const teamsRouter = Router();

teamsRouter.post('/set/:userId?/:teamIndex', async (req, res) => {
  try {
    const { teamIndex, userId: userIdStr } = req.params;
    const {
      srcdsApi,
      sessionData: { permissions, userId: ownUserId, steamId },
    } = res.locals;

    const settingOwnTeam = userIdStr == null;
    const userId = settingOwnTeam ? ownUserId : Number(userIdStr);

    if (!settingOwnTeam) {
      if (!permissions.includes('teams_others_edit')) {
        return res.status(403).end();
      }

      srcdsApi.getOnlinePlayers().then((players) => {
        const player = players.find((p) => p.userId === userId);

        if (player) {
          db.logs.add('menu_force_player_team', steamId, {
            steamId: player.steamId,
            teamIndex,
          });
        }
      });
    }

    srcdsApi.setPlayerTeam(userId, Number(teamIndex));

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
