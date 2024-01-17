import {
  Cvar,
  StartMatchSettings,
  cvarsInfo,
  matchCvars,
} from '@motd-menu/common';
import { Router } from 'express';
import { getPlayersProfiles } from 'src/steam';
import { sanitizeCvarValue } from 'src/util';

export const matchApi = Router();

matchApi.post('/start', async (req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { token, permissions },
    } = res.locals;

    if (!permissions.includes('match_organizer')) return res.status(403).end();

    try {
      const { cvars, players } = req.body as StartMatchSettings;

      if (!players || Object.keys(players).length < 2) {
        throw 'At least 2 players are required to start a match';
      }

      const preTimerCommands: string[] = [];
      const postTimerCommands: string[] = [];

      for (const [cvar, value] of Object.entries(cvars) as [Cvar, string][]) {
        if (!matchCvars.includes(cvar)) continue;

        const cmd = `${cvar} ${sanitizeCvarValue(value)}`;
        const cmdTarget = cvarsInfo[cvar].executeBeforeMatch
          ? preTimerCommands
          : postTimerCommands;

        cmdTarget.push(cmd);
      }

      const onlinePlayers = await srcdsApi.getOnlinePlayers();

      for (const [steamId, teamIndex] of Object.entries(players)) {
        const player = onlinePlayers.find((p) => p.steamId === steamId);

        if (!player) {
          const disconnectedPlayer = (await getPlayersProfiles([steamId]))[
            steamId
          ];
          const disconnectedPlayerName = disconnectedPlayer?.name ?? steamId;

          throw `Failed to start the match (${disconnectedPlayerName} left the game)`;
        }

        preTimerCommands.push(`motd_team_change ${player.userId} ${teamIndex}`);
      }

      await srcdsApi.startMatch(token, preTimerCommands, postTimerCommands);
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
