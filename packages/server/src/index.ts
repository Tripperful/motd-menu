import './config';
import './ws/servers';

import bodyParser from 'body-parser';
import express, { type ErrorRequestHandler } from 'express';
import expressStaticGzip from 'express-static-gzip';
import https from 'https';
import path from 'path';
import fs from 'fs/promises';

import { BaseWsApiServer } from '@motd-menu/common';
import { WebSocketServer } from 'ws';
import { api } from './api';
import { authMiddleware } from './auth';
import { db } from './db';
import { metricsMiddleware } from './metrics/middleware';
import { metricsRouter } from './metrics/router';
import { EfpsWatchdog } from './util/efps';

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

const getSslContext = async () => {
  let cert = process.env.MOTD_SSL_CERT;
  let key = process.env.MOTD_SSL_PRIVATE_KEY;

  if (cert && key) {
    return { cert, key };
  }

  for (let i = 0; i < 5; i++) {
    try {
      const domain = process.env.MOTD_DOMAIN;

      cert = await fs.readFile(
        `/etc/letsencrypt/live/${domain}/fullchain.pem`,
        'utf-8',
      );
      key = await fs.readFile(
        `/etc/letsencrypt/live/${domain}/privkey.pem`,
        'utf-8',
      );
    } catch {}

    if (cert && key) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (!cert || !key) {
    throw new Error('Missing SSL certificate or private key');
  }

  return { cert, key };
};

const startHttpServer = async () => {
  const port = Number(process.env.MOTD_WEB_PORT);

  const server = https.createServer(await getSslContext(), app);

  server.listen(port, () => {
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

    console.log(`HTTPS server is listening on port ${port}`);
  });

  const certReloadInterval = 60 * 60 * 1000; // 1 hour

  setInterval(async () => {
    try {
      server.setSecureContext(await getSslContext());
    } catch (e) {
      console.error('Failed to reload SSL certificate:', e);
    }
  }, certReloadInterval);

  server.on('close', () => clearInterval(certReloadInterval));

  return server;
};

console.log('Connecting to database...');

db.init()
  .then(() => {
    console.log('Database initialized');
    startHttpServer();
  })
  .catch((e) => {
    console.error('Failed to initialize database:', e);
  });
