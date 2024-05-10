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
  | 'sv_showlagcompensation'
  | 'mp_teamplay'
  | 'mp_friendlyfire'
  | 'mp_flashlight'
  | 'mp_footsteps'
  | 'mp_forcerespawn'
  | 'mp_timelimit'
  | 'mp_fraglimit'
  | 'mm_equalizer'
  | 'mm_overtime'
  | 'mm_hotbolt_fix'
  | 'mm_new_shotgun'
  | 'mm_shotgun_tracehull_size'
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

export interface OptionCvarProps {
  options: {
    title: string;
    value: string;
  }[];
}

export type CvarProps =
  | ({ type: 'bool' } & BoolCvarProps)
  | ({ type: 'number' } & NumberCvarProps)
  | ({ type: 'text' } & TextCvarProps)
  | ({ type: 'option' } & OptionCvarProps);

export type CvarType = CvarProps['type'];

export type CvarInfo = {
  description: string;
  permissions: CvarPermissions;
  executeBeforeMatch?: boolean;
  mockValue: string;
} & CvarProps;

export const cvarsInfo: Record<Cvar, CvarInfo> = {
  hostname: {
    description: 'Server host name',
    type: 'text',
    maxLength: 100,
    permissions: adminEditPermissions,
    executeBeforeMatch: true,
    mockValue: 'Test server',
  },
  sv_password: {
    description: 'Server password',
    type: 'text',
    maxLength: 100,
    permissions: adminOnlyPermissions,
    executeBeforeMatch: true,
    mockValue: '',
  },
  sv_cheats: {
    description: 'Cheats',
    type: 'bool',
    permissions: adminEditPermissions,
    mockValue: '0',
  },
  sv_showlagcompensation: {
    description: 'Show server-side hitboxes',
    type: 'bool',
    permissions: adminEditPermissions,
    mockValue: '0',
  },
  mm_equalizer: {
    description: 'Equalizer',
    type: 'bool',
    permissions: matchmakingPermissions,
    executeBeforeMatch: true,
    mockValue: '0',
  },
  mm_esp_teammates: {
    description: 'Allow teammates ESP',
    type: 'bool',
    permissions: matchmakingPermissions,
    executeBeforeMatch: true,
    mockValue: '1',
  },
  mp_teamplay: {
    description: 'Team play',
    type: 'bool',
    permissions: adminEditPermissions,
    executeBeforeMatch: true,
    mockValue: '1',
  },
  mp_friendlyfire: {
    description: 'Friendly fire',
    type: 'bool',
    permissions: matchmakingPermissions,
    mockValue: '1',
  },
  sv_alltalk: {
    description: 'All talk',
    type: 'bool',
    permissions: matchmakingPermissions,
    mockValue: '1',
  },
  mp_flashlight: {
    description: 'Allow flashlight',
    type: 'bool',
    permissions: matchmakingPermissions,
    mockValue: '1',
  },
  sv_infinite_aux_power: {
    description: 'Infinite suit power',
    type: 'bool',
    permissions: adminEditPermissions,
    mockValue: '0',
  },
  mp_footsteps: {
    description: 'Foot steps',
    type: 'bool',
    permissions: matchmakingPermissions,
    mockValue: '1',
  },
  mp_forcerespawn: {
    description: 'Force palyer respawn',
    type: 'bool',
    permissions: matchmakingPermissions,
    mockValue: '1',
  },
  mm_hotbolt_fix: {
    description: 'Crossbow bolt boosting',
    type: 'option',
    options: [
      { title: 'Default', value: '0' },
      { title: 'Disabled', value: '1' },
      { title: 'Enhanced', value: '2' },
    ],
    permissions: matchmakingPermissions,
    mockValue: '1',
  },
  mm_new_shotgun: {
    description: 'Improved shotgun behavior',
    type: 'bool',
    permissions: matchmakingPermissions,
    mockValue: '1',
  },
  mm_shotgun_tracehull_size: {
    description: 'Shotgun trace hull size',
    type: 'number',
    min: 0,
    max: 24,
    permissions: adminEditPermissions,
    mockValue: '1.5',
  },
  mp_timelimit: {
    description: 'Time limit (minutes)',
    type: 'number',
    min: 0,
    max: 240,
    permissions: matchmakingPermissions,
    mockValue: '30',
  },
  mp_fraglimit: {
    description: 'Frag limit',
    type: 'number',
    min: 0,
    max: 1000,
    permissions: matchmakingPermissions,
    mockValue: '0',
  },
  mm_overtime: {
    description: 'Overtime in case of draw (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
    mockValue: '60',
  },
  sv_gravity: {
    description: 'Gravity',
    type: 'number',
    min: -1000,
    max: 1000,
    permissions: adminEditPermissions,
    mockValue: '600',
  },
  sv_hl2mp_item_respawn_time: {
    description: 'Items respawn time (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
    mockValue: '30',
  },
  sv_hl2mp_weapon_respawn_time: {
    description: 'Weapons respawn time (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
    mockValue: '20',
  },
  mm_rpg_spawn_time: {
    description: 'RPG respawn time (seconds)',
    type: 'number',
    min: 0,
    max: 300,
    permissions: matchmakingPermissions,
    mockValue: '20',
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
