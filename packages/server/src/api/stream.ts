import type { Response as ExpressResponse } from 'express';
import { Router } from 'express';
import { getSrcdsApi } from 'src/srcdsApi';
import { getPlayersProfiles } from 'src/steam';
import { dbgInfo } from 'src/util';
import { wsApi } from 'src/ws';

export const streamRouter = Router();

let streamResponses: { res: ExpressResponse; sessionId: string }[] = [];

setInterval(() => {
  const sessionIds = Array.from(streamResponses).map((s) => s.sessionId);

  for (const sessionId of sessionIds) {
    const streamClients = Array.from(streamResponses).filter(
      (s) => s.sessionId === sessionId,
    );

    const dropClientsBySessionId = () => {
      streamResponses = streamResponses.filter(
        (s) => s.sessionId !== sessionId,
      );
    };

    if (!streamClients.length) {
      dropClientsBySessionId();
      continue;
    }

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

        for (const streamClient of streamClients) {
          const { res } = streamClient;
          if (res.writable && !res.closed) {
            res.write(`data: ${JSON.stringify({ timestamp, players })}\n\n`);
          } else {
            streamResponses = streamResponses.filter((s) => s.res !== res);
          }
        }
      })
      .catch(() => {
        for (const { res } of streamClients) {
          dropClientsBySessionId();
          res.status(500).end();
        }
      });
  }
}, 100);

streamRouter.get('/:sessionId', async (req, res) => {
  const { sessionData } = res.locals;
  const { permissions } = sessionData ?? {};

  if (!permissions?.includes('streamer')) {
    res.status(403).end();
    return;
  }

  const { sessionId } = req.params;

  const connectedServers = wsApi.getConnectedServers();

  if (!connectedServers.find((s) => s.sessionId === sessionId)) {
    dbgInfo(
      `Stream for session ${sessionId} not found at ${new Date().toString()}`,
    );
    res.status(404).end(`Server with session ID ${sessionId} is not connected`);
    return;
  }

  streamResponses.push({ res, sessionId });

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  dbgInfo(
    `Stream connected for session ${sessionId} at ${new Date().toString()}`,
  );

  res.on('close', () => {
    dbgInfo(
      `Stream ended for session ${sessionId} at ${new Date().toString()}`,
    );
  });
});
