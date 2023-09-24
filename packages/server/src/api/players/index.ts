import { Router } from 'express';
import { getPlayersProfiles } from 'src/steam';
import { permissionsApi } from './permissions';

export const playersApi = Router();

playersApi.use('/permissions', permissionsApi);

playersApi.get('/', async (_req, res) => {
  try {
    const { srcdsApi } = res.locals;

    const playersSteamIds = await srcdsApi.getOnlinePlayersSteamIds();

    const playerProfiles = await getPlayersProfiles(playersSteamIds);

    res.status(200).end(JSON.stringify(Object.values(playerProfiles)));
  } catch {
    res.status(500).end();
  }
});
