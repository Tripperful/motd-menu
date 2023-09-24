import { Permission } from './types/permissions';

export type Cvar = 'mp_teamplay' | 'mp_timelimit' | 'sv_cheats';

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

export const cvarGroups: Partial<Record<Cvar, CvarPermissions>> = {
  mp_teamplay: {
    view: ['cvars_matchmaking_view'],
    edit: ['cvars_matchmaking_edit'],
  },
  mp_timelimit: {
    view: ['cvars_matchmaking_view'],
    edit: ['cvars_matchmaking_edit'],
  },
  sv_cheats: {
    view: ['cvars_admin_view'],
    edit: ['cvars_admin_edit'],
  },
};

const getAccessibleCvars = (
  permissions: Permission[],
  accessType: keyof CvarPermissions,
) => {
  const res = [] as Cvar[];

  for (const [cvar, cvarPermissions] of Object.entries(cvarGroups)) {
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
