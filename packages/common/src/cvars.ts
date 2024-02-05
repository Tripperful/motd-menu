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

const adminOnlyPermissions: CvarPermissions = {
  view: ['cvars_admin_view'],
  edit: ['cvars_admin_edit'],
};

const adminEditPermissions: CvarPermissions = {
  view: [],
  edit: ['cvars_admin_edit'],
};

const matchmakingPermissions: CvarPermissions = {
  view: [],
  edit: ['cvars_matchmaking_edit'],
};

export type Cvar =
  | 'hostname'
  | 'sv_password'
  | 'sv_cheats'
  | 'sv_alltalk'
  | 'sv_gravity'
  | 'sv_infinite_aux_power'
  | 'sv_hl2mp_item_respawn_time'
  | 'sv_hl2mp_weapon_respawn_time'
  | 'mp_teamplay'
  | 'mp_friendlyfire'
  | 'mp_flashlight'
  | 'mp_footsteps'
  | 'mp_forcerespawn'
  | 'mp_timelimit'
  | 'mm_equalizer'
  | 'mm_overtime'
  | 'mm_hotbolt_fix'
  | 'mm_esp_teammates'
  | 'mm_show_endmatch_rate'
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

export type CvarInfo = {
  description: string;
  permissions: CvarPermissions;
  executeBeforeMatch?: boolean;
} & CvarProps;

export const cvarsInfo: Record<Cvar, CvarInfo> = {
  hostname: {
    description: 'Server host name',
    type: 'text',
    maxLength: 100,
    permissions: adminEditPermissions,
    executeBeforeMatch: true,
  },
  sv_password: {
    description: 'Server password',
    type: 'text',
    maxLength: 100,
    permissions: adminOnlyPermissions,
    executeBeforeMatch: true,
  },
  sv_cheats: {
    description: 'Cheats',
    type: 'bool',
    permissions: adminEditPermissions,
  },
  mm_equalizer: {
    description: 'Equalizer',
    type: 'bool',
    permissions: matchmakingPermissions,
    executeBeforeMatch: true,
  },
  mm_esp_teammates: {
    description: 'Allow teammates ESP',
    type: 'bool',
    permissions: matchmakingPermissions,
    executeBeforeMatch: true,
  },
  mp_teamplay: {
    description: 'Team play',
    type: 'bool',
    permissions: adminEditPermissions,
    executeBeforeMatch: true,
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
  sv_infinite_aux_power: {
    description: 'Infinite suit power',
    type: 'bool',
    permissions: adminEditPermissions,
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
  mm_show_endmatch_rate: {
    description: 'Show map rate menu after matches',
    type: 'bool',
    permissions: adminOnlyPermissions,
  },
  mm_hotbolt_fix: {
    description: 'Crossbow boost fix',
    type: 'number',
    min: 0,
    max: 2,
    permissions: matchmakingPermissions,
  },
  mp_timelimit: {
    description: 'Time limit (minutes)',
    type: 'number',
    min: 0,
    max: 240,
    permissions: matchmakingPermissions,
  },
  mm_overtime: {
    description: 'Overtime in case of draw (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
  },
  sv_gravity: {
    description: 'Gravity',
    type: 'number',
    min: -1000,
    max: 1000,
    permissions: adminEditPermissions,
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
    const requiredPermissions = cvarInfo.permissions[accessType];

    if (requiredPermissions?.length === 0) {
      // If cvar requires no permissions, allow
      res.push(cvar as Cvar);
    } else {
      // Check if the user has any of the permissions
      // required to access the cvar
      for (const cvarPermission of requiredPermissions) {
        if (permissions.includes(cvarPermission)) {
          res.push(cvar as Cvar);
        }
      }
    }
  }

  return res;
};

export const getViewableCvars = (permissions: Permission[]) =>
  getAccessibleCvars(permissions, 'view');

export const getEditableCvars = (permissions: Permission[]) =>
  getAccessibleCvars(permissions, 'edit');
