import { Router } from 'express';
import { db } from 'src/db';
import { SrcdsWsApiServer } from 'src/ws/servers/srcds/SrcdsWsApiServer';

export const srcdsRouter = Router();

srcdsRouter.post('/runCommand', async (req, res) => {
  try {
    const commands = req.body.command as string;
    const { srcds } = res.locals;

    const { permissions, steamId } = res.locals.sessionData;

    if (!permissions.includes('rcon')) {
      return res.status(403).end();
    }

    srcds.send('run_command', { commands });
    db.logs.add('menu_rcon_command', steamId, { commands });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

srcdsRouter.get('/onlineServers', async (_, res) => {
  try {
    const onlineServers = SrcdsWsApiServer.getInstace().getConnectedClients();

    res.status(200).json(onlineServers.map((s) => s.getInfo()));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

srcdsRouter.get('/onlineServers/maps', async (_, res) => {
  try {
    const onlineServers = SrcdsWsApiServer.getInstace().getConnectedClients();

    const maps = await Promise.all(
      onlineServers.map(async (srcds) => {
        return {
          serverInfo: srcds.getInfo(),
          maps: await srcds.request('get_maps_request'),
        };
      }),
    );

    res.status(200).json(maps);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

srcdsRouter.get('/onlineServers/players', async (_, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('dev')) return res.status(403).end();

    const onlineServers = SrcdsWsApiServer.getInstace().getConnectedClients();

    const players = await Promise.all(
      onlineServers.map(async (srcds) => {
        return {
          serverInfo: srcds.getInfo(),
          players: await srcds.request('get_players_request'),
        };
      }),
    );

    res.status(200).json(players);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
