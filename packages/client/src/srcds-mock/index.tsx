import { OnlinePlayerInfo, WsMessage, uuid } from '@motd-menu/common';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WsClient } from 'src/util/ws';

const isHttps = location.protocol === 'https:';
const searchParams = new URLSearchParams(location.search);
const auth = searchParams.get('auth');
const guid = searchParams.get('guid');

const wsUrl = `ws${isHttps ? 's' : ''}://${
  location.host
}?auth=${auth}&guid=${guid}`;

const wsClient = new WsClient(wsUrl);

type OnlinePlayer = OnlinePlayerInfo & { token: string };
let onlinePlayers: OnlinePlayer[] = [];

wsClient.subscribe(
  'motd_auth_request',
  async ({ data: token }: WsMessage<string>) => {
    const player = onlinePlayers.find((p) => p.token === token);

    return {
      type: 'motd_auth_response',
      data: player ?? {},
    };
  },
);

wsClient.subscribe('get_players_request', async () => {
  return {
    type: 'get_players_response',
    data: onlinePlayers,
  };
});

let nextUserId = 1;
let nextSteamId = BigInt('76561197960465565');

const App: FC = () => {
  const [players, setPlayers] = useState<OnlinePlayer[]>(onlinePlayers);

  useEffect(() => {
    onlinePlayers = players;
  }, [players]);

  const onAddPlayer = useCallback(() => {
    const token = uuid();
    const steamId = (nextSteamId++).toString();
    const userId = nextUserId++;
    const name = steamId.substring(steamId.length - 8);

    const newPlayer: OnlinePlayer = {
      token,
      userId,
      steamId,
      name,
    };

    setPlayers((cur) => [...cur, newPlayer]);

    wsClient.send('player_connected', {
      token,
      steamId,
      name,
      ip: '127.0.0.1',
      port: 27005,
    });
  }, []);

  const onDeletePlayer = useCallback((token: string) => {
    setPlayers((c) => c.filter((p) => p.token !== token));

    wsClient.send('player_disconnected', {
      token,
      connectionStats: {
        in: {
          avgchoke: 0,
          avglatency: 0,
          avgloss: 0,
          avgpackets: 0,
          totaldata: 0,
        },
        out: {
          avgchoke: 0,
          avglatency: 0,
          avgloss: 0,
          avgpackets: 0,
          totaldata: 0,
        },
      },
    });
  }, []);

  return (
    <div>
      <button onClick={onAddPlayer}>Add player</button>
      <div>
        {players.map((p) => (
          <div key={p.token}>
            <a
              target="_blank"
              rel="noreferrer"
              href={`${location.protocol}//${location.host}?guid=test&token=${p.token}`}
            >
              {p.name}
            </a>
            &nbsp;
            <button onClick={() => onDeletePlayer(p.token)}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
};

createRoot(document.querySelector('#root')).render(<App />);
