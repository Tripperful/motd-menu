import './config';
import './ws/servers';

import bodyParser from 'body-parser';
import express, { type ErrorRequestHandler } from 'express';
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
import { metricsRouter } from './metrics/router';
import { metricsMiddleware } from './metrics/middleware';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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
app.use(bodyParser.json());
app.use(authMiddleware);
app.use(metricsMiddleware);
app.use('/metrics', metricsRouter);
app.use('/api', api);
app.use(staticServer);
app.use((_req, res) =>
  res.sendFile(path.resolve(__dirname, staticDir + '/index.html')),
);
app.use(((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send('Internal server error');
}) as ErrorRequestHandler);

export interface HttpServerInfo {
  server: http.Server;
  port: number;
  protocol: 'http' | 'https';
}

export let httpServerInfo: HttpServerInfo = null;

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
  port: Number(process.env.MOTD_WEB_PORT),
  protocol: 'https',
};
console.log('Connecting to database...');

db.init().then(() => {
  console.log('Database initialized');

  const { server, port, protocol } = httpServerInfo;

  server.listen(port, () => {
    console.log(
      `${protocol.toUpperCase()} server is listening on port ${port}`,
    );

    // new EfpsWatchdog();

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
