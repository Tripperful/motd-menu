import { Cvar } from '@motd-menu/common';
import { CvarControlSettings } from '.';

export const cvarControlOptionsMap: Record<Cvar, CvarControlSettings> = {
  hostname: {
    type: 'text',
  },
  sv_cheats: {
    type: 'switch',
  },
  mp_friendlyfire: {
    type: 'switch',
  },
  sv_alltalk: {
    type: 'switch',
  },
  mm_equalizer: {
    type: 'switch',
  },
  mm_esp_teammates: {
    type: 'switch',
  },
  sv_gravity: {
    type: 'number',
    min: 0,
    max: 1000,
  },
  sv_hl2mp_item_respawn_time: {
    type: 'number',
    min: 0,
    max: 100,
  },
  sv_hl2mp_weapon_respawn_time: {
    type: 'number',
    min: 0,
    max: 100,
  },
  mm_rpg_spawn_time: {
    type: 'number',
    min: 0,
    max: 100,
  },
};
