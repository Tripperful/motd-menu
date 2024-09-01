import {
  PlayerChatAction,
  PlayerClientSettings,
  PlayerConnectedReqest,
  PlayerDisconnectedReqest,
  SetSettingsAction,
  WsMessage,
  WsMessageType,
  WsSubscriberCallback,
} from '@motd-menu/common';
import { dropAuthCache } from 'src/auth';
import { db } from 'src/db';
import { getPlayerProfile } from 'src/steam';
import { matchStatsHandlers } from './matchStatsHandlers';
import { getEfpsRank } from 'src/util/efps';
import { dbgErr } from 'src/util';
import { wsApi } from '.';
import { getSrcdsApi } from 'src/srcdsApi';

export const wsHandlers: Partial<Record<WsMessageType, WsSubscriberCallback>> =
  {
    player_connected: async (
      msg: WsMessage<PlayerConnectedReqest>,
      serverId,
      sessionId,
    ) => {
      const { token, steamId, ip, port } = msg.data;

      const profile = await getPlayerProfile(steamId);

      db.client.connected(
        token,
        steamId,
        serverId,
        ip,
        port,
        profile?.name || null,
      );

      try {
        const rankData = await getEfpsRank(steamId);

        if (rankData.rank) {
          const srcdsApi = getSrcdsApi(sessionId);
          srcdsApi.rankUpdate([rankData]);
        }
      } catch (e) {
        dbgErr(e);
      }
    },

    player_disconnected: (msg: WsMessage<PlayerDisconnectedReqest>) => {
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

    player_chat: async (msg: WsMessage<PlayerChatAction>) => {
      const { steamId, msg: text } = msg.data;

      if (text.startsWith('!test333 ')) {
        const command = text.slice(9).trim();

        return {
          type: 'client_exec',
          data: {
            steamId,
            command,
          },
        };
      }
    },

    get_settings_request: async (msg: WsMessage<string>) => {
      const {
        fov,
        magnumZoomFov,
        crossbowZoomFov,
        drawViewmodel,
        esp,
        dsp,
        hitSound,
        killSound,
      } = await db.client.settings.get(msg.data);

      const aka = (await db.client.getAka(msg.data)) ?? '';

      return {
        type: 'get_settings_response',
        data: {
          fov,
          magnumZoomFov,
          crossbowZoomFov,
          drawviewmodel: drawViewmodel ? 1 : 0,
          esp: esp ? 1 : 0,
          dsp: dsp ? 1 : 0,
          hitsound: hitSound ? 1 : 0,
          killsound: killSound ? 1 : 0,
          aka,
        },
      };
    },

    set_settings: async (msg: WsMessage<SetSettingsAction>) => {
      const { steamId, settings: s } = msg.data;

      const settings: PlayerClientSettings = {
        fov: s.fov,
        magnumZoomFov: s.magnumZoomFov,
        crossbowZoomFov: s.crossbowZoomFov,
        drawViewmodel:
          s.drawviewmodel == null ? null : Boolean(s.drawviewmodel),
        esp: s.esp == null ? null : Boolean(s.esp),
        dsp: s.dsp == null ? null : Boolean(s.dsp),
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

    ...matchStatsHandlers,
  };
