import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import http from 'http';
import https from 'https';
import path from 'path';
import { api } from './api';
import { authMiddleware } from './auth';
import { db } from './db';
import { logDbgInfo } from './util';
import { bindWsDummy } from './wsDummy';

const app = express();

const staticDir = path.resolve(__dirname, '../../client/dist');
const staticServer = expressStaticGzip(staticDir, {
  serveStatic: { immutable: true },
});

app.set('x-powered-by', false);
app.use((_, res, next) => {
  res.cookie('sendLogs', JSON.stringify(logDbgInfo));
  next();
});
app.use(cookieParser());
app.use('/', authMiddleware);
app.use(bodyParser.json({ strict: false }));
app.use('/api', api);
app.use(staticServer);
app.use((_req, res) =>
  res.sendFile(path.resolve(__dirname, staticDir + '/index.html')),
);

interface ServerInfo {
  server: http.Server;
  port: number;
  protocol: 'http' | 'https';
}

const servers: ServerInfo[] = [];

if (process.env.MOTD_WEB_PORT) {
  servers.push({
    server: http.createServer(app),
    port: Number(process.env.MOTD_WEB_PORT),
    protocol: 'http',
  });
}

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

  servers.push({
    server: https.createServer({ cert, key }, app),
    port: Number(process.env.MOTD_WEB_PORT_HTTPS),
    protocol: 'https',
  });
}

db.init().then(() => {
  console.log('Database initialized');

  for (const serverInfo of servers) {
    const { server, port, protocol } = serverInfo;

    server.listen(port, () => {
      console.log(
        `${protocol.toUpperCase()} server is listening on port ${port}`,
      );

      bindWsDummy(server);
    });
  }
});
