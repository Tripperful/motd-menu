import {
  Cvar,
  MatchFilters,
  StartMatchSettings,
  base64encode,
  chatColor,
  cvarsInfo,
  matchCvars,
} from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { getPlayerProfile, getPlayersProfiles } from 'src/steam';
import { sanitizeCvarValue } from 'src/util';

export const matchRouter = Router();

matchRouter.get('/', async (req, res) => {
  try {
    const { srcds } = res.locals;
    const result = await srcds.request('get_match_state_request');

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/results/:offset?', async (req, res) => {
  try {
    const { offset } = req.params;
    const { mapName, players, serverName, matchStatuses } = req.query;
    const { permissions } = res.locals.sessionData;

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

    const profiles = await getPlayersProfiles(
      playersSteamIds,
      permissions.includes('view_city'),
    );

    for (const match of result.data) {
      for (const team of match.teams) {
        for (const player of team.players) {
          player.profile = profiles[player.steamId];
        }
      }
    }

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { permissions } = res.locals.sessionData;

    const result = await db.matches.get(matchId);

    const playersSteamIds = [
      ...new Set(
        result.teams.flatMap((team) =>
          team.players.map((player) => player.steamId),
        ),
      ),
    ];

    const profiles = await getPlayersProfiles(
      playersSteamIds,
      permissions.includes('view_city'),
    );

    for (const team of result.teams) {
      for (const player of team.players) {
        player.profile = profiles[player.steamId];
      }
    }

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/deaths/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.getMatchDeaths(matchId);

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/damage/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.getMatchDamage(matchId);

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/accuracy/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await db.matches.getMatchAccuracy(matchId);

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.get('/misc/:matchId/:steamId', async (req, res) => {
  try {
    const { matchId, steamId } = req.params;

    const result = await db.matches.getMiscPlayerStats(matchId, steamId);

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.post('/replace/:whomSteamId/:withWhomSteamId', async (req, res) => {
  try {
    const { whomSteamId, withWhomSteamId } = req.params;
    const {
      srcds,
      sessionData: { steamId },
    } = res.locals;

    const onlinePlayers = await srcds.request('get_players_request');

    if (!onlinePlayers.some((p) => p.steamId === withWhomSteamId)) {
      return res.status(400).end('The replacing player is not online');
    }

    const profiles = await getPlayersProfiles([whomSteamId, withWhomSteamId]);

    srcds.send('motd_open', {
      clients: [withWhomSteamId],
      url: `rc/${steamId}/${whomSteamId}`,
    });

    srcds.send('chat_print', {
      clients: [steamId],
      text: `${chatColor.Info}Waiting for ${chatColor.Value}${profiles[withWhomSteamId]?.name ?? withWhomSteamId}${chatColor.Info} to accept the replacement...`,
    });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

matchRouter.post('/rc/:whomSteamId', async (req, res) => {
  const { whomSteamId } = req.params;
  const {
    srcds,
    sessionData: { steamId },
  } = res.locals;

  try {
    const profiles = await getPlayersProfiles([whomSteamId, steamId]);

    const whomNameEncoded = base64encode(
      profiles[whomSteamId]?.name ?? whomSteamId,
    );
    const withWhomNameEncoded = base64encode(
      profiles[steamId]?.name ?? steamId,
    );

    srcds.send('run_command', {
      commands: `mm_substitute ${whomSteamId} ${steamId} "${whomNameEncoded}" "${withWhomNameEncoded}"`,
    });

    res.status(200).end();
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

matchRouter.get('/efps/:matchId', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;
    const { matchId } = req.params;

    if (!permissions.includes('dev')) {
      return res.status(403).end();
    }

    const efpsStats = await db.matches.getEfpsStats(matchId);

    if (efpsStats) {
      return res.status(200).json(efpsStats);
    }

    res.status(404).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
