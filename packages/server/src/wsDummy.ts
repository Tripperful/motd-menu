import { createHash } from 'crypto';
import type http from 'http';
import { WebSocketServer } from 'ws';

export const bindWsDummy = (server: http.Server) => {
  if (!process.env.MOTD_WS_AUTH_PASSWORD) {
    throw new Error(
      'MOTD_WS_AUTH_PASSWORD env variable must be set to establish a secure WS connection',
    );
  }

  const wsServer = new WebSocketServer({
    noServer: true,
  });

  server.on('upgrade', (req, socket, head) => {
    const pwHash = createHash('md5')
      .update(process.env.MOTD_WS_AUTH_PASSWORD)
      .digest('hex');

    const searchParams = new URL(req.url, `http://${req.headers.host}`)
      ?.searchParams;

    if (searchParams?.get('auth')?.toLowerCase() !== pwHash.toLowerCase()) {
      const ip = req.socket.remoteAddress;
      const port = req.socket.remotePort;

      console.warn(`Unauthorized WS upgrade request from ${ip}:${port}`);
      return socket.destroy();
    }

    wsServer.handleUpgrade(req, socket, head, (ws) => {
      wsServer.emit('connection', ws, req);
    });
  });

  wsServer.on('connection', (ws, req) => {
    const { remoteAddress, remotePort } = req.socket;
    const remoteHost = `${remoteAddress}:${remotePort}`;

    console.log(`New WS connection: ${remoteHost}`);

    ws.on('message', async (data) => {
      try {
        const txtData = data.toString('utf-8');

        console.log(`Incoming WS message from ${remoteHost}: ${txtData}`);

        await new Promise((res) => setTimeout(res, 1000));

        console.log(`Sending data back to ${remoteHost} after 1 second`);

        ws.send(txtData);
      } catch (e) {
        let dataAscii = 'ERROR';
        let dataUtf8 = 'ERROR';
        let dataBase64 = 'ERROR';

        try {
          dataAscii = data.toString('ascii');
        } catch {}

        try {
          dataUtf8 = data.toString('utf-8');
        } catch {}

        try {
          dataBase64 = data.toString('base64');
        } catch {}

        ws.send(
          JSON.stringify({
            type: 'wsError',
            error: e,
            errorMsg: e?.message,
            errorStack: e?.stack,
            dataAscii,
            dataUtf8,
            dataBase64,
          }),
        );
      }
    });
  });
};
