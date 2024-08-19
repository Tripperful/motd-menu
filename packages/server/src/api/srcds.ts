import { Router } from 'express';
import { db } from 'src/db';
import { getSrcdsApi } from 'src/srcdsApi';
import { wsApi } from 'src/ws';

export const srcdsRouter = Router();

srcdsRouter.post('/runCommand', async (req, res) => {
  try {
    const { command } = req.body;
    const { srcdsApi } = res.locals;

    const { permissions, steamId } = res.locals.sessionData;

    if (!permissions.includes('rcon')) {
      return res.status(403).end();
    }

    srcdsApi.runCommand(command);

    db.logs.add('menu_rcon_command', steamId, { command });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

srcdsRouter.get('/onlineServers', async (_, res) => {
  try {
    const onlineServers = wsApi.getConnectedServers();

    res.status(200).json(onlineServers);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

srcdsRouter.get('/onlineServers/maps', async (_, res) => {
  try {
    const onlineServers = wsApi.getConnectedServers();

    const maps = await Promise.all(
      onlineServers.map(async (server) => {
        const srcdsApi = getSrcdsApi(server.sessionId);
        return {
          serverInfo: server.serverInfo,
          maps: await srcdsApi.getMaps(),
        };
      }),
    );

    res.status(200).json(maps);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
