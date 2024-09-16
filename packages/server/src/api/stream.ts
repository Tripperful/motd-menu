import { StreamFrame } from '@motd-menu/common';
import { Router } from 'express';
import { getSrcdsApi } from 'src/srcdsApi';
import { getPlayersProfiles } from 'src/steam';

export const streamRouter = Router();

const streamCacheLifetime = 0.125 * 1000; // 0.125 seconds

const streamCache: Record<
  string,
  {
    lastUpdate: number;
    data: StreamFrame;
  }
> = {};

streamRouter.get('/:sessionId', (req, res) => {
  const { sessionData } = res.locals;
  const { permissions } = sessionData ?? {};

  if (!permissions?.includes('streamer')) {
    res.status(403).end();
    return;
  }

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let interValID = setInterval(() => {
    const { sessionId } = req.params;
    const cache = streamCache[sessionId];
    let response = cache?.data;

    if ((cache?.lastUpdate ?? 0) < Date.now() - streamCacheLifetime) {
      const srcdsApi = getSrcdsApi(sessionId);

      srcdsApi
        .getOnlinePlayers()
        .then(async (players) => {
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

          res.write(`data: ${JSON.stringify(response)}\n\n`);
        })
        .catch(() => {
          res.status(500).end();
        });
    } else {
      res.write(`data: ${JSON.stringify(response)}\n\n`);
    }
  }, streamCacheLifetime);

  res.on('close', () => {
    clearInterval(interValID);
    res.end();
  });
});
