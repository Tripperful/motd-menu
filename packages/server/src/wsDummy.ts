import type http from 'http';
import { AddressInfo, WebSocketServer } from 'ws';

export const bindWsDummy = (server: http.Server) => {
  const wsServer = new WebSocketServer({
    server,
    verifyClient: () => true,
  });

  wsServer.on('listening', () => {
    `WebSocket server listening on port ${
      (server.address() as AddressInfo).port
    }`;
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
