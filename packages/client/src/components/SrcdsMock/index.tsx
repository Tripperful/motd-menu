import {
  Cvar,
  OnlinePlayerInfo,
  WsMessage,
  cvarsInfo,
  uuid,
} from '@motd-menu/common';
import React, { FC, useCallback, useEffect, useState } from 'react';
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

const cvarValues: Partial<Record<Cvar, string>> = {};

wsClient.subscribe<Cvar[]>('get_cvars_request', async ({ data: cvars }) => {
  return {
    type: 'get_cvars_response',
    data: Object.fromEntries(
      cvars.map((cvar) => {
        cvarValues[cvar] ??= cvarsInfo[cvar].mockValue;

        return [cvar, cvarValues[cvar]];
      }),
    ),
  };
});

wsClient.subscribe<{ cvar: Cvar; value: string }>(
  'set_cvar',
  async ({ data: { cvar, value } }) => {
    cvarValues[cvar] = value;
  },
);

wsClient.subscribe('get_players_request', async () => {
  return {
    type: 'get_players_response',
    data: onlinePlayers,
  };
});

wsClient.subscribe('get_maps_request', async () => {
  return {
    type: 'get_maps_response',
    data: ['dm_ethic', 'dm_lockdown', 'aim_arena_reloaded', 'dm_lostarena_rpg'],
  };
});

let nextUserId = 1;
let nextSteamId = BigInt('76561197960465565');

const steamIdToPseudoUuid = (steamId: string) => {
  const steamIdBigInt = BigInt(steamId);

  // 16 random bytes generated from the steamId
  const bytes = new Uint8Array(16);
  const lastByteMask = BigInt(0xff);

  for (let i = 0; i < 8; i++) {
    bytes[i] = Number((steamIdBigInt >> BigInt(i * 8)) & lastByteMask);
    bytes[i + 8] = Number((steamIdBigInt >> BigInt(i * 8)) & lastByteMask);
  }

  return uuid({
    random: bytes,
  });
};

export const SrcdsMock: FC = () => {
  const [players, setPlayers] = useState<OnlinePlayer[]>(onlinePlayers);
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    onlinePlayers = players;
  }, [players]);

  const onSendWsMessage = useCallback(() => {
    const message: WsMessage = JSON.parse(msgText);

    wsClient.send(message.type, message.data, uuid());
  }, [msgText]);

  const onAddPlayer = useCallback(() => {
    const steamId = (nextSteamId++).toString();
    const token = steamIdToPseudoUuid(steamId);
    const userId = nextUserId++;
    const name = steamId.substring(steamId.length - 8);

    const newPlayer: OnlinePlayer = {
      token,
      userId,
      steamId,
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

  const onGetSettings = (steamId: string) => {
    wsClient.request('get_settings_request', steamId);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="WS message..."
        value={msgText}
        onChange={(e) => setMsgText(e.currentTarget.value)}
      ></input>
      &nbsp;
      <button onClick={onSendWsMessage}>Send WS message</button>
      <br />
      <button onClick={onAddPlayer}>Add player</button>
      <div>
        {players.map((p) => (
          <div key={p.token}>
            <a
              target="_blank"
              rel="noreferrer"
              href={`${location.protocol}//${location.host}?guid=test&token=${p.token}`}
            >
              {p.steamId}
            </a>
            &nbsp;
            <button onClick={() => onDeletePlayer(p.token)}>X</button>
            <button onClick={() => onGetSettings(p.steamId)}>
              get_settings
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SrcdsMock;
