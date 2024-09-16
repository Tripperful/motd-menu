import { StreamFrame } from '@motd-menu/common';
import { Router } from 'express';
import { getSrcdsApi } from 'src/srcdsApi';
import { getPlayersProfiles } from 'src/steam';

export const streamRouter = Router();

const streamCacheLifetime = 0.5 * 1000; // 0.5 seconds

const streamCache: Record<
  string,
  {
    lastUpdate: number;
    data: StreamFrame;
  }
> = {};

streamRouter.get('/:sessionId', async (req, res) => {
  try {
    const { sessionData } = res.locals;
    const { permissions } = sessionData ?? {};

    if (!permissions?.includes('streamer')) {
      res.status(403).end();
      return;
    }

    const { sessionId } = req.params;
    const cache = streamCache[sessionId];
    let response = cache?.data;

    if ((cache?.lastUpdate ?? 0) < Date.now() - streamCacheLifetime) {
      const srcdsApi = getSrcdsApi(sessionId);

      const players = await srcdsApi.getOnlinePlayers();
      const playerProfiles = await getPlayersProfiles(
        players.map((p) => p.steamId),
      );

      for (const player of players) {
        player.steamProfile = playerProfiles[player.steamId];
      }

      const timestamp = Date.now();

      streamCache[sessionId] = {
        lastUpdate: Date.now(),
        data: {
          timestamp,
          players,
        },
      };

      response = streamCache[sessionId].data;
    }

    res.status(200).end(JSON.stringify(response));
  } catch (e) {
    res.status(500).end();
  }
});
