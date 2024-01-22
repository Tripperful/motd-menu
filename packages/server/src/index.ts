import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';
import { config } from '~root/config';
import { api } from './api';
import { authMiddleware } from './auth';
import { db } from './db';
import { logDbgInfo } from './util';
import { JsonUdp } from './udp';
import { MockUdpServer } from './mock/MockUdpServer';

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

  app.listen(config.port, () => {
    console.log(`MOTD-menu web server listening at port ${config.port}`);
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
