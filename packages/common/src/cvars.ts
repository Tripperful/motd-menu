import { Permission } from './types/permissions';

/**
 * Permissions required for the cvar.
 */
interface CvarPermissions {
  /**
   * If the user has any of these permissions,
   * they will be able to view the cvar value.
   */
  view?: Permission[];

  /**
   * If the user has any of these permissions,
   * they will be able to edit the cvar value.
   */
  edit?: Permission[];
}

const adminPermissions: CvarPermissions = {
  view: ['cvars_admin_view'],
  edit: ['cvars_admin_edit'],
};

const matchmakingPermissions: CvarPermissions = {
  view: ['cvars_matchmaking_view'],
  edit: ['cvars_matchmaking_edit'],
};

export type Cvar =
  | 'hostname'
  | 'sv_cheats'
  | 'sv_alltalk'
  | 'sv_gravity'
  | 'sv_hl2mp_item_respawn_time'
  | 'sv_hl2mp_weapon_respawn_time'
  | 'mp_friendlyfire'
  | 'mp_flashlight'
  | 'mp_footsteps'
  | 'mp_forcerespawn'
  | 'mp_timelimit'
  | 'mm_equalizer'
  | 'mm_esp_teammates'
  | 'mm_rpg_spawn_time';

export interface BoolCvarProps {}

export interface NumberCvarProps {
  min?: number;
  max?: number;
}

export interface TextCvarProps {
  maxLength?: number;
}

export type CvarProps =
  | ({ type: 'bool' } & BoolCvarProps)
  | ({ type: 'number' } & NumberCvarProps)
  | ({ type: 'text' } & TextCvarProps);

export type CvarType = CvarProps['type'];

type CvarInfo = {
  description: string;
  permissions: CvarPermissions;
} & CvarProps;

export const cvarsInfo: Record<Cvar, CvarInfo> = {
  hostname: {
    description: 'Server host name',
    type: 'text',
    maxLength: 100,
    permissions: adminPermissions,
  },
  sv_cheats: {
    description: 'Cheats',
    type: 'bool',
    permissions: adminPermissions,
  },
  mm_equalizer: {
    description: 'Equalizer',
    type: 'bool',
    permissions: matchmakingPermissions,
  },
  mm_esp_teammates: {
    description: 'Allow teammates ESP',
    type: 'bool',
    permissions: matchmakingPermissions,
  },
  mp_friendlyfire: {
    description: 'Friendly fire',
    type: 'bool',
    permissions: matchmakingPermissions,
  },
  sv_alltalk: {
    description: 'All talk',
    type: 'bool',
    permissions: matchmakingPermissions,
  },
  mp_flashlight: {
    description: 'Allow flashlight',
    type: 'bool',
    permissions: matchmakingPermissions,
  },
  mp_footsteps: {
    description: 'Foot steps',
    type: 'bool',
    permissions: matchmakingPermissions,
  },
  mp_forcerespawn: {
    description: 'Force palyer respawn',
    type: 'bool',
    permissions: matchmakingPermissions,
  },
  mp_timelimit: {
    description: 'Time limit (minutes)',
    type: 'number',
    min: 0,
    max: 240,
    permissions: matchmakingPermissions,
  },
  sv_gravity: {
    description: 'Gravity',
    type: 'number',
    min: -1000,
    max: 1000,
    permissions: adminPermissions,
  },
  sv_hl2mp_item_respawn_time: {
    description: 'Items respawn time (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
  },
  sv_hl2mp_weapon_respawn_time: {
    description: 'Weapons respawn time (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
  },
  mm_rpg_spawn_time: {
    description: 'RPG respawn time (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
  },
};

const getAccessibleCvars = (
  permissions: Permission[],
  accessType: keyof CvarPermissions,
) => {
  const res = [] as Cvar[];

  for (const [cvar, cvarInfo] of Object.entries(cvarsInfo)) {
    for (const cvarPermission of cvarInfo.permissions[accessType]) {
      if (permissions.includes(cvarPermission)) res.push(cvar as Cvar);
    }
  }

  return res;
};

export const getViewableCvars = (permissions: Permission[]) =>
  getAccessibleCvars(permissions, 'view');

export const getEditableCvars = (permissions: Permission[]) =>
  getAccessibleCvars(permissions, 'edit');
