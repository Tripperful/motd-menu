import { Permission } from './types/permissions';

export const cvarDisplayNames = {
  hostname: 'Server host name',
  sv_cheats: 'Cheats',
  mm_equalizer: 'Equalizer',
  mm_esp_teammates: 'Allow teammates ESP',
  mp_friendlyfire: 'Friendly fire',
  sv_alltalk: 'All talk',
  sv_gravity: 'Gravity',
  sv_hl2mp_item_respawn_time: 'Items respawn time',
  sv_hl2mp_weapon_respawn_time: 'Weapons respawn time',
  mm_rpg_spawn_time: 'RPG respawn time',
};

export type Cvar = keyof typeof cvarDisplayNames;

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

export const cvarPermissionGroups: Record<Cvar, CvarPermissions> = {
  hostname: adminPermissions,
  sv_cheats: adminPermissions,
  mm_equalizer: matchmakingPermissions,
  mm_esp_teammates: matchmakingPermissions,
  mp_friendlyfire: matchmakingPermissions,
  sv_alltalk: matchmakingPermissions,
  sv_gravity: adminPermissions,
  sv_hl2mp_item_respawn_time: matchmakingPermissions,
  sv_hl2mp_weapon_respawn_time: matchmakingPermissions,
  mm_rpg_spawn_time: matchmakingPermissions,
};

const getAccessibleCvars = (
  permissions: Permission[],
  accessType: keyof CvarPermissions,
) => {
  const res = [] as Cvar[];

  for (const [cvar, cvarPermissions] of Object.entries(cvarPermissionGroups)) {
    for (const cvarPermission of cvarPermissions[accessType]) {
      if (permissions.includes(cvarPermission)) res.push(cvar as Cvar);
    }
  }

  return res;
};

export const getViewableCvars = (permissions: Permission[]) =>
  getAccessibleCvars(permissions, 'view');

export const getEditableCvars = (permissions: Permission[]) =>
  getAccessibleCvars(permissions, 'edit');
