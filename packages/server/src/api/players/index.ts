import {
  CustomRankData,
  maxColorRankLength,
  maxGradientRankLength,
} from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { getPlayerProfile, getPlayersProfiles } from 'src/steam';
import { getRankData, toSrcdsRankData } from 'src/util/ranks';
import { SrcdsWsApiServer } from 'src/ws/servers/srcds/SrcdsWsApiServer';
import { akaRouter } from './aka';
import { permissionsRouter } from './permissions';
import { playerSettingsRouter } from './settings';

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

    await Promise.all([
      (async () => {
        const playerProfiles = await getPlayersProfiles(
          onlinePlayers.map((p) => p.steamId),
          permissions.includes('view_city'),
        );

        for (const player of onlinePlayers) {
          player.steamProfile = playerProfiles[player.steamId];
        }
      })(),
      ...onlinePlayers.map(async (p) => {
        p.aka = await db.client.getAka(p.steamId);
      }),
    ]);

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

    const rankData = await getRankData(steamId);

    res.status(200).json(rankData);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.post('/customRank/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const customRank = req.body.customRank as CustomRankData;

    const {
      sessionData: { permissions, steamId: mySteamId },
    } = res.locals;

    if (
      !(
        permissions.includes('custom_ranks_edit') ||
        (steamId === mySteamId && db.client.getCustomRankSubscription(steamId))
      )
    ) {
      return res.status(403).end();
    }

    if (customRank?.title) {
      const maxRankLength =
        customRank.colorStops.length > 1
          ? maxGradientRankLength
          : maxColorRankLength;

      if (customRank.title.length > maxRankLength) {
        return res.status(400).end();
      }
    }

    await db.client.setCustomRank(steamId, customRank);

    for (const srcds of SrcdsWsApiServer.getInstace().getConnectedClients()) {
      const rankUpdateData = toSrcdsRankData(await getRankData(steamId));
      rankUpdateData.show = true;

      srcds.send('rank_update', [rankUpdateData]);
    }

    res.status(200).end();
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

playersRouter.get('/serversStats/:steamId', async (req, res) => {
  try {
    const {
      sessionData: { permissions },
    } = res.locals;

    if (!permissions.includes('dev')) {
      return res.status(403).end();
    }

    const { steamId } = req.params;

    res.status(200).json(await db.client.getServersStats(steamId));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

playersRouter.get('/cvarSimilarity/:steamId', async (req, res) => {
  try {
    const {
      sessionData: { permissions },
    } = res.locals;

    if (!permissions.includes('cvars_advanced_view')) {
      return res.status(403).end();
    }

    const { steamId } = req.params;

    res.status(200).json(await db.client.getCvarSimilarity(steamId));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
