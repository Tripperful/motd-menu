import {
  Cvar,
  StartMatchSettings,
  cvarsInfo,
  matchCvars,
} from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { getPlayerProfile } from 'src/steam';
import { sanitizeCvarValue } from 'src/util';

export const matchRouter = Router();

matchRouter.get('/results/:offset?', async (req, res) => {
  try {
    const { offset } = req.params;

    const result = await db.matches.get(50, Number(offset ?? 0));

    res.status(200).end(JSON.stringify(result));
  } catch {
    res.status(500).end();
  }
});

matchRouter.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.get(matchId);

    res.status(200).end(JSON.stringify(result));
  } catch {
    res.status(500).end();
  }
});

matchRouter.get('/deaths/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.getMatchDeaths(matchId);

    res.status(200).end(JSON.stringify(result));
  } catch {
    res.status(500).end();
  }
});

matchRouter.post('/start', async (req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { token, permissions },
    } = res.locals;

    if (!permissions.includes('match_organizer')) return res.status(403).end();

    try {
      const { cvars, players } = req.body as StartMatchSettings;

      if (
        !players ||
        Object.values(players).filter((teamIndex) => teamIndex !== 1).length < 2
      ) {
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
          const disconnectedPlayer = await getPlayerProfile(steamId);
          const disconnectedPlayerName = disconnectedPlayer?.name ?? steamId;

          throw `Failed to start the match (${disconnectedPlayerName} left the game)`;
        }

        preTimerCommands.push(`motd_team_change ${player.userId} ${teamIndex}`);
      }

      srcdsApi.startMatch(token, preTimerCommands, postTimerCommands);
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
