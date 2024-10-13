import {
  Cvar,
  MatchFilters,
  StartMatchSettings,
  cvarsInfo,
  matchCvars,
} from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { getPlayerProfile, getPlayersProfiles } from 'src/steam';
import { sanitizeCvarValue } from 'src/util';

export const matchRouter = Router();

matchRouter.get('/results/:offset?', async (req, res) => {
  try {
    const { offset } = req.params;
    const { mapName, players, serverName, matchStatuses } = req.query;

    const filters: MatchFilters = {};

    if (mapName) filters.mapName = mapName as string;
    if (players) filters.players = JSON.parse(players as string);
    if (serverName) filters.serverName = serverName as string;
    if (matchStatuses)
      filters.matchStatuses = JSON.parse(matchStatuses as string);

    const result = await db.matches.get(50, Number(offset ?? 0), filters);

    const playersSteamIds = [
      ...new Set(
        result.data.flatMap((match) =>
          match.teams.flatMap((team) =>
            team.players.map((player) => player.steamId),
          ),
        ),
      ),
    ];

    const profiles = await getPlayersProfiles(playersSteamIds);

    for (const match of result.data) {
      for (const team of match.teams) {
        for (const player of team.players) {
          player.profile = profiles[player.steamId];
        }
      }
    }

    res.status(200).end(JSON.stringify(result));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.get(matchId);

    const playersSteamIds = [
      ...new Set(
        result.teams.flatMap((team) =>
          team.players.map((player) => player.steamId),
        ),
      ),
    ];

    const profiles = await getPlayersProfiles(playersSteamIds);

    for (const team of result.teams) {
      for (const player of team.players) {
        player.profile = profiles[player.steamId];
      }
    }

    res.status(200).end(JSON.stringify(result));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/deaths/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.getMatchDeaths(matchId);

    res.status(200).end(JSON.stringify(result));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/damage/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.getMatchDamage(matchId);

    res.status(200).end(JSON.stringify(result));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.post('/start', async (req, res) => {
  try {
    const {
      srcds,
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

      const onlinePlayers = await srcds.request('get_players_request');

      for (const [steamId, teamIndex] of Object.entries(players)) {
        const player = onlinePlayers.find((p) => p.steamId === steamId);

        if (!player) {
          const disconnectedPlayer = await getPlayerProfile(steamId);
          const disconnectedPlayerName = disconnectedPlayer?.name ?? steamId;

          throw `Failed to start the match (${disconnectedPlayerName} left the game)`;
        }

        preTimerCommands.push(`motd_team_change ${player.userId} ${teamIndex}`);
      }

      srcds.send('start_match', {
        token,
        preTimerCommands: preTimerCommands.join(';'),
        postTimerCommands: postTimerCommands.join(';'),
      });
    } catch (e) {
      return res
        .status(400)
        .end(typeof e === 'string' ? e : 'Failed to start a match');
    }

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
