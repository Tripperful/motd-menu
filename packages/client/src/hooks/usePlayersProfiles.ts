import { errorSteamProfile, SteamPlayerData } from '@motd-menu/common';
import { useEffect, useState } from 'react';
import { playerSteamProfilesState } from './state/players';

export const usePlayersProfiles = (steamIds: string[]) => {
  const [playersProfiles, setPlayersProfiles] = useState<
    Record<string, SteamPlayerData>
  >(() =>
    Object.fromEntries(
      steamIds.map((steamId) => {
        let cachedProfile = playerSteamProfilesState.getRaw(steamId);

        if (!cachedProfile || cachedProfile instanceof Promise) {
          cachedProfile = errorSteamProfile(steamId);
        }

        return [steamId, cachedProfile];
      }),
    ),
  );

  useEffect(() => {
    const profiles: Record<string, SteamPlayerData> = {};

    Promise.allSettled(
      steamIds.map(async (steamId) => {
        const profile = await playerSteamProfilesState.get(steamId);

        if (profile?.name) {
          profiles[steamId] = profile;
        }
      }),
    ).then(() => {
      setPlayersProfiles(profiles);
    });
  }, [steamIds]);

  return playersProfiles;
};
