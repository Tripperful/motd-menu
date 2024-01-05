import { Permission } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { useSessionData } from '../useSessionData';
import { createGlobalState } from './util';

const playerPermissionsState = createGlobalState(async (steamId: string) => {
  const { steamId: mySteamId, permissions: myPermissions } = useSessionData();

  if (steamId === mySteamId) {
    return myPermissions;
  }

  return await motdApi.getPlayerPermissions(steamId);
});

export const usePlayerPermissions = (steamId: string) =>
  playerPermissionsState.useExternalState(steamId);

export const useMyPermissions = () => {
  return usePlayerPermissions(useSessionData().steamId);
};

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
