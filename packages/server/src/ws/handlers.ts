import { PlayerClientSettings } from '@motd-menu/common';
import { dropAuthCache } from 'src/auth';
import { db } from 'src/db';
import { WsSubscriberCallback } from '.';
import {
  PlayerConnectedReq,
  PlayerDisconnectedReq,
  SetSettingsAct,
  WsMessage,
  WsMessageType,
} from './WsMessageType';

export const wsHandlers: Partial<Record<WsMessageType, WsSubscriberCallback>> =
  {
    player_connected: (msg: WsMessage<PlayerConnectedReq>) => {
      const { token, steamId, name, ip, port } = msg.data;

      db.client.connected(token, steamId, ip, port, name);
    },

    player_disconnected: (msg: WsMessage<PlayerDisconnectedReq>) => {
      const { token, connectionStats: s } = msg.data;

      dropAuthCache(token);

      db.client.disconnected(
        token,
        s.in.avglatency,
        s.in.avgloss,
        s.in.avgchoke,
        s.in.avgpackets,
        s.in.totaldata,
        s.out.avglatency,
        s.out.avgloss,
        s.out.avgchoke,
        s.out.avgpackets,
        s.out.totaldata,
      );
    },

    get_settings_request: async (msg: WsMessage<string>) => {
      const { fov, drawViewmodel, esp, hitSound, killSound } =
        await db.client.settings.get(msg.data);

      return {
        type: 'get_settings_response',
        data: {
          fov,
          drawviewmodel: drawViewmodel ? 1 : 0,
          esp: esp ? 1 : 0,
          hitsound: hitSound ? 1 : 0,
          killsound: killSound ? 1 : 0,
        },
      };
    },

    set_settings: async (msg: WsMessage<SetSettingsAct>) => {
      const { steamId, settings: s } = msg.data;

      const settings: PlayerClientSettings = {
        fov: s.fov,
        drawViewmodel:
          s.drawviewmodel == null ? null : Boolean(s.drawviewmodel),
        esp: s.esp == null ? null : Boolean(s.esp),
        hitSound: s.hitsound == null ? null : Boolean(s.hitsound),
        killSound: s.killsound == null ? null : Boolean(s.killsound),
      };

      db.client.settings.set(steamId, settings);
    },

    get_smurfs_request: async (msg: WsMessage<string>) => ({
      type: 'get_smurfs_response',
      data: await db.client.getSmurfSteamIds(msg.data),
    }),

    get_names_request: async (msg: WsMessage<string>) => ({
      type: 'get_names_response',
      data: await db.client.getNames(msg.data),
    }),
  };
