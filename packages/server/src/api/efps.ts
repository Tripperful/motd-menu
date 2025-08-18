import { Router } from 'express';
import { db } from 'src/db';
import { SrcdsWsApiServer } from 'src/ws/servers/srcds/SrcdsWsApiServer';

export const efpsRouter = Router();

efpsRouter.get('/servers', async (req, res) => {
  try {
    const {
      sessionData: { permissions },
    } = res.locals;

    if (!permissions.includes('dev')) {
      return res.status(403).end();
    }

    const servers = await Promise.all(
      SrcdsWsApiServer.getInstace()
        .getConnectedClients()
        .map(async (connectedSrcds) => {
          const players =
            (await connectedSrcds
              .request('get_players_request')
              .catch(() => [])) ?? [];

          const { mp_teamplay } = await connectedSrcds.request(
            'get_cvars_request',
            ['mp_teamplay'],
          );

          const playersIps: Record<string, string> = {};

          await Promise.all(
            players.map(async (player) => {
              const ip = await db.client.getLastIp(player.steamId);
              if (ip) {
                playersIps[player.steamId] = ip;
              }
            }),
          );

          return {
            server: connectedSrcds.getInfo().name,
            teamplay: mp_teamplay !== '0',
            players: players.map((player) => ({
              steamid: player.steamId,
              teamid: player.teamIdx,
              latency: player.ping,
              ip: playersIps[player.steamId] ?? null,
            })),
          };
        }) ?? [],
    );

    res.json({ servers }).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
