import { WsMessageType } from '@motd-menu/common';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import http from 'http';
import https from 'https';
import path from 'path';
import { api } from './api';
import { authMiddleware } from './auth';
import './config';
import { db } from './db';
import { TelegramService } from './telegram';
import { dbgWarn } from './util';
import { EfpsWatchdog } from './util/efps';
import { WsApi } from './ws';
import { wsHandlers } from './ws/handlers';

const app = express();

const staticDir = path.resolve(__dirname, '../../client/dist');
const staticServer = expressStaticGzip(staticDir, {
  serveStatic: { immutable: true },
});

app.use('/healthcheck', (_req, res) => res.send('healthy'));
app.set('x-powered-by', false);
app.use(cookieParser());
app.use('/', authMiddleware);
// app.use(TelegramService.middleware);
app.use(bodyParser.json({ strict: false }));
app.use('/api', api);
app.use(staticServer);
app.use((_req, res) =>
  res.sendFile(path.resolve(__dirname, staticDir + '/index.html')),
);

export interface HttpServerInfo {
  server: http.Server;
  port: number;
  protocol: 'http' | 'https';
}

export let httpServerInfo: HttpServerInfo = null;

if (process.env.MOTD_WEB_PORT_HTTPS) {
  const cert = process.env.MOTD_SSL_CERT;
  const key = process.env.MOTD_SSL_PRIVATE_KEY;

  if (!cert) {
    throw new Error(
      'Trying to start HTTPS server without supplying a certificate',
    );
  }

  if (!key) {
    throw new Error(
      'Trying to start HTTPS server without supplying a private key',
    );
  }

  httpServerInfo = {
    server: https.createServer({ cert, key }, app),
    port: Number(process.env.MOTD_WEB_PORT_HTTPS),
    protocol: 'https',
  };
} else if (process.env.MOTD_WEB_PORT) {
  httpServerInfo = {
    server: http.createServer(app),
    port: Number(process.env.MOTD_WEB_PORT),
    protocol: 'http',
  };
}

console.log('Connecting to database...');

db.init().then(() => {
  console.log('Database initialized');

  const { server, port, protocol } = httpServerInfo;

  server.listen(port, () => {
    console.log(
      `${protocol.toUpperCase()} server is listening on port ${port}`,
    );

    new EfpsWatchdog();

    // if (process.env.MOTD_TELEGRAM_BOT_TOKEN) {
    //   new TelegramService(process.env.MOTD_TELEGRAM_BOT_TOKEN);
    // }

    const wsApi = WsApi.init(server, async (authKey: string) => {
      const serverInfo = await db.server.getByApiKey(authKey);

      if (!serverInfo) return null;

      if (serverInfo.blocked) {
        dbgWarn(
          `A blocked server attempted WS connection (${serverInfo.name})`,
        );
        return null;
      }

      return serverInfo;
    });

    for (const [msgType, handler] of Object.entries(wsHandlers)) {
      wsApi.subscribe(msgType as WsMessageType, handler);
    }
  });
});
