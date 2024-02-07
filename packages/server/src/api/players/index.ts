import { Router } from 'express';
import { db } from 'src/db';
import { getPlayersProfiles } from 'src/steam';
import { akaApi } from './aka';
import { permissionsApi } from './permissions';

export const playersApi = Router();

playersApi.use('/permissions', permissionsApi);
playersApi.use('/aka', akaApi);

playersApi.get('/', async (_req, res) => {
  try {
    const { srcdsApi } = res.locals;

    const onlinePlayers = await srcdsApi.getOnlinePlayers();

    const playerProfiles = await getPlayersProfiles(
      onlinePlayers.map((p) => p.steamId),
    );

    for (const player of onlinePlayers) {
      player.steamProfile = playerProfiles[player.steamId];
    }

    res.status(200).end(JSON.stringify(Object.values(onlinePlayers)));
  } catch {
    res.status(500).end();
  }
});

playersApi.get('/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    const playerProfile = (await getPlayersProfiles([steamId]))[steamId];

    res.status(200).end(JSON.stringify(playerProfile));
  } catch {
    res.status(500).end();
  }
});

playersApi.get('/timeplayed/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const {
      sessionData: { token },
    } = res.locals;

    res
      .status(200)
      .end((await db.client.getTotalTimePlayed(steamId, token)).toString());
  } catch {
    res.status(500).end();
  }
});

playersApi.get('/smurfs/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    const smurfs = await db.client.getSmurfSteamIds(steamId);

    res.status(200).end(JSON.stringify(smurfs));
  } catch {
    res.status(500).end();
  }
});

playersApi.get('/names/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    const names = await db.client.getNames(steamId);

    res.status(200).end(JSON.stringify(names));
  } catch {
    res.status(500).end();
  }
});
