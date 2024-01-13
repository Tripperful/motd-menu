import { Router } from 'express';
import { getPlayersProfiles } from 'src/steam';
import { permissionsApi } from './permissions';

export const playersApi = Router();

playersApi.use('/permissions', permissionsApi);

playersApi.get('/', async (_req, res) => {
  try {
    const { srcdsApi } = res.locals;

    const onlinePlayers = await srcdsApi.getOnlinePlayers();

    const playerProfiles = await getPlayersProfiles(
      onlinePlayers.map((p) => p.steamId),
    );

    for (const [steamId, profile] of Object.entries(playerProfiles)) {
      const player = onlinePlayers.find((p) => p.steamId === steamId);

      if (player) {
        player.steamProfile = profile;
      }
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
