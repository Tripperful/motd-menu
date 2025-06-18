import { db } from 'src/db';
import { onlinePlayersGauge } from 'src/metrics';
import { getPlayerProfile } from 'src/steam';
import { dbgErr } from 'src/util';
import { getGeoDataByIp } from 'src/util/countries';
import { getRankData, toSrcdsRankData } from 'src/util/ranks';
import { SrcdsWsApiServer } from './SrcdsWsApiServer';

const srcdsWsServer = SrcdsWsApiServer.getInstace();

srcdsWsServer.onRequest('player_connected_request', async (srcds, data) => {
  const { token, steamId, ip, port } = data;

  srcds
    .request('get_players_request')
    .then((players) => {
      onlinePlayersGauge.set(
        {
          server: srcds.getInfo().name ?? 'unknown',
        },
        players?.length ?? 0,
      );
    })
    .catch(dbgErr);

  getPlayerProfile(steamId)
    .then((profile) => {
      db.client.connected(
        token,
        steamId,
        srcds.getInfo().id,
        ip,
        port,
        profile?.name || null,
      );
    })
    .catch(dbgErr);

  getRankData(steamId)
    .then((rankData) => {
      const rankUpdateData = toSrcdsRankData(rankData);
      rankUpdateData.show = false;

      if (rankUpdateData.rank) {
        srcds.send('rank_update', [rankUpdateData]);
      }
    })
    .catch(dbgErr);

  const [geoData, aka] = await Promise.all([
    getGeoDataByIp(ip),
    db.client.getAka(data.steamId),
  ]);

  const geo = geoData.countryCode === 'XX' ? '' : geoData.country;

  return {
    type: 'player_connected_response' as const,
    data: { aka, geo },
  };
});

srcdsWsServer.onRequest('get_smurfs_request', async (srcds, data) => ({
  type: 'get_smurfs_response',
  data: await db.client.getSmurfSteamIds(data),
}));

srcdsWsServer.onRequest('get_names_request', async (srcds, data) => ({
  type: 'get_names_response',
  data: await db.client.getNames(data),
}));

srcdsWsServer.onRequest('get_client_settings_request', async (srcds, data) => ({
  type: 'get_client_settings_response',
  data: await db.client.settings.getValues(data),
}));
