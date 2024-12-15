import { Router } from 'express';
import { db } from 'src/db';
import { getPlayerProfile, getPlayersProfiles } from 'src/steam';
import { akaRouter } from './aka';
import { permissionsRouter } from './permissions';
import { playerSettingsRouter } from './settings';
import { getEfpsRank } from 'src/util/efps';

export const playersRouter = Router();

playersRouter.use('/permissions', permissionsRouter);
playersRouter.use('/aka', akaRouter);
playersRouter.use('/settings', playerSettingsRouter);

playersRouter.get('/', async (_req, res) => {
  try {
    const {
      srcds,
      sessionData: { permissions },
    } = res.locals;

    const onlinePlayers = (await srcds.request('get_players_request')) ?? [];

    const playerProfiles = await getPlayersProfiles(
      onlinePlayers.map((p) => p.steamId),
      permissions.includes('view_city'),
    );

    for (const player of onlinePlayers) {
      player.steamProfile = playerProfiles[player.steamId];
    }

    res.status(200).json(Object.values(onlinePlayers));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.get('/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const { permissions } = res.locals.sessionData;

    const playerProfile = await getPlayerProfile(
      steamId,
      permissions.includes('view_city'),
    );

    res.status(200).json(playerProfile);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.get('/stats/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    const efpsRank = await getEfpsRank(steamId);

    res.status(200).json({ efpsRank });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.get('/timeplayed/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const {
      sessionData: { token },
    } = res.locals;

    res
      .status(200)
      .end((await db.client.getTotalTimePlayed(steamId, token)).toString());
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.get('/smurfs/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    const smurfs = (await db.client.getSmurfSteamIds(steamId)) ?? [];

    res.status(200).json(smurfs);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.get('/names/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;

    const names = (await db.client.getNames(steamId)) ?? [];

    res.status(200).json(names);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.get('/findByName/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { permissions } = res.locals.sessionData;

    if (name.length < 3) {
      return res.status(200).json([]);
    }

    const steamIds = await db.client.findByName(name);
    const profiles = steamIds?.length
      ? Object.values(
          await getPlayersProfiles(steamIds, permissions.includes('view_city')),
        )
      : [];

    res.status(200).json(profiles);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
