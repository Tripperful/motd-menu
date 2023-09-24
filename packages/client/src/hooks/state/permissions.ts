import { Permission } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const playerPermissionsState = createGlobalState((steamId: string) =>
  motdApi.getPlayerPermissions(steamId),
);

export const usePlayerPermissions = (steamId: string) =>
  playerPermissionsState.useExternalState(steamId);

export const setPlayerPermissionGranted = (
  steamId: string,
  permission: Permission,
  grant: boolean,
) =>
  playerPermissionsState.set(async (cur) => {
    const curSync = await cur;
    const has = curSync.includes(permission);

    if ((grant && has) || (!grant && !has)) return curSync;

    const newPermissions = curSync.filter((p) => p !== permission);

    if (grant) newPermissions.push(permission);

    return newPermissions;
  }, steamId);
