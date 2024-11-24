import './config';
import './ws/servers';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import http from 'http';
import https from 'https';
import path from 'path';

import { BaseWsApiServer } from '@motd-menu/common';
import { WebSocketServer } from 'ws';
import { api } from './api';
import { authMiddleware } from './auth';
import { db } from './db';
import { EfpsWatchdog } from './util/efps';

const app = express();

const staticDir = path.resolve(__dirname, '../../client/dist');
const staticServer = expressStaticGzip(staticDir, {
  serveStatic: { immutable: true },
});

const storybookStaticDir = path.resolve(
  __dirname,
  '../../client/storybook-static',
);
const storybookStaticServer = expressStaticGzip(storybookStaticDir, {
  serveStatic: { immutable: true },
});

app.use('/healthcheck', (_req, res) => res.send('healthy'));
app.set('x-powered-by', false);
app.use('/storybook', storybookStaticServer);
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

    const wsServer = new WebSocketServer({ noServer: true });

    server.on('upgrade', async (req, socket, head) => {
      for (const wsApiServer of BaseWsApiServer.getRegisteredWsApiServers()) {
        if (wsApiServer.canHandleUpgrade(req)) {
          const client = await wsApiServer.onUpgrade(
            req,
            socket,
            head,
            wsServer,
          );

          if (client) break;
        }
      }
    });

    server.on('error', (err) => {
      console.error('WS server error:', err);
    });
  });
});
