import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';
import { WebSocketServer } from 'ws';
import { config } from '~root/config';
import { api } from './api';
import { authMiddleware } from './auth';
import { db } from './db';
import { MockUdpServer } from './mock/MockUdpServer';
import { JsonUdp } from './udp';
import { logDbgInfo } from './util';

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

export const jsonUdp = new JsonUdp(
  Number(process.env.MOTD_UDP_PORT),
  process.env.MOTD_AES_PASSWORD,
);

db.init().then(() => {
  console.log('Database initialized');

  const server = app.listen(config.port, () => {
    console.log(`MOTD-menu web server listening at port ${config.port}`);

    const wsServer = new WebSocketServer({
      server,
    });

    wsServer.on('listening', () => {
      `WebSocket server listening at port ${config.port}`;
    });

    wsServer.on('connection', (ws, req) => {
      const { remoteAddress, remotePort } = req.socket;
      const remoteHost = `${remoteAddress}:${remotePort}`;

      console.log(`New WS connection: ${remoteHost}`);

      ws.on('message', async (data) => {
        const txtData = data.toString('utf-8');

        console.log(`Incoming WS message from ${remoteHost}: ${txtData}`);

        await new Promise((res) => setTimeout(res, 1000));

        console.log(`Sending data back to ${remoteHost} after 1 second`);

        ws.send(txtData);
      });
    });
  });

  jsonUdp.connect();

  if (process.env.MOTD_MOCK_UDP_SERVER_PORT) {
    const mockServer = new MockUdpServer(
      new JsonUdp(
        Number(process.env.MOTD_MOCK_UDP_SERVER_PORT),
        process.env.MOTD_AES_PASSWORD,
        'MOCK UDP SERVER',
      ),
    );

    mockServer.start();
  }
});
