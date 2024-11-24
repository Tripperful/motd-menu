import { BaseWsApiServer } from '@motd-menu/common';
import { Router } from 'express';

export const debugRouter = Router();

debugRouter.use((req, res, next) => {
  try {
    const { sessionData } = res.locals;
    if (!sessionData.permissions.includes('dev')) {
      console.warn(
        `Unauthorized access to debug API: ${JSON.stringify({
          ip: req.ip,
          url: req.url,
          sessionData,
        })}`,
      );
      return res.status(401).end();
    }
    next();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

debugRouter.get('/ws', async (req, res) => {
  try {
    const servers = BaseWsApiServer.getRegisteredWsApiServers();

    const serverInfos = servers.map((s) => ({
      name: s.constructor.name,
      connectedClients: s.getConnectedClients().map((c) => ({
        info: c.getInfo(),
        connectedDuration: c.getConnectedDuration(),
      })),
    }));

    return res.status(200).json(serverInfos);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
