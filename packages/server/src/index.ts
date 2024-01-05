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

db.init().then(() => {
  app.listen(config.port, () => {
    console.log(`MOTD-menu server listening at port ${config.port}`);
  });
});
