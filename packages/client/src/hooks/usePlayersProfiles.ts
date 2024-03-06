import { SteamPlayerData } from '@motd-menu/common';
import { useEffect, useState } from 'react';
import { playerSteamProfilesState } from './state/players';

export const usePlayersProfiles = (steamIds: string[]) => {
  const [playersProfiles, setPlayersProfiles] = useState<
    Record<string, SteamPlayerData>
  >({});

  useEffect(() => {
    const profiles: Record<string, SteamPlayerData> = {};

    Promise.allSettled(
      steamIds.map(async (steamId) => {
        profiles[steamId] = await playerSteamProfilesState.get(steamId);
      }),
    ).then(() => {
      setPlayersProfiles(profiles);
    });
  }, [steamIds]);

  return playersProfiles;
};
