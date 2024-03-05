import { SteamPlayerData } from '@motd-menu/common';

interface GetPlayerSummariesResponse {
  response: {
    players: {
      steamid: string;
      personaname: string;
      avatarfull: string;
    }[];
  };
}

const errorProfile = (steamId: string) =>
  ({
    steamId,
    name: steamId,
    avatar:
      'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  }) as SteamPlayerData;

export const getPlayersProfilesNoBatch = async (steamIds64: string[]) => {
  try {
    const res = (await (
      await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
          process.env.MOTD_STEAM_API_KEY
        }&steamids=${steamIds64.join(',')}`,
      )
    ).json()) as GetPlayerSummariesResponse;

    return Object.fromEntries(
      steamIds64.map((steamId) => {
        const profile = res.response.players.find((p) => p.steamid === steamId);

        return [
          steamId,
          profile
            ? { steamId, name: profile.personaname, avatar: profile.avatarfull }
            : errorProfile(steamId),
        ];
      }),
    );
  } catch {
    return Object.fromEntries(
      steamIds64.map((steamId) => [steamId, errorProfile(steamId)]),
    );
  }
};

const profilesToFetch = new Set<string>();
let fetchTimeout: NodeJS.Timeout = null;
const profilesCallbacks: ((
  profiles: Record<string, SteamPlayerData>,
) => void)[] = [];

const flushProfiles = async () => {
  const profiles = await getPlayersProfilesNoBatch(Array.from(profilesToFetch));

  profilesToFetch.clear();
  fetchTimeout = null;

  for (const cb of profilesCallbacks) {
    cb(profiles);
  }
  profilesCallbacks.length = 0;
};

const debounceProfilesFetch = () => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
  }

  fetchTimeout = setTimeout(flushProfiles, 500);
};

export const getPlayersProfiles = async (steamIds64: string[]) =>
  new Promise<Record<string, SteamPlayerData>>((resolve) => {
    profilesCallbacks.push((profiles) => {
      const requestedProfiles = Object.fromEntries(
        steamIds64.map((id) => [id, profiles[id]]),
      );

      resolve(requestedProfiles);
    });

    for (const id of steamIds64) {
      profilesToFetch.add(id);
    }

    debounceProfilesFetch();
  });

export const getPlayerProfile = async (steamId64: string) =>
  new Promise<SteamPlayerData>((resolve) => {
    profilesCallbacks.push((profiles) => resolve(profiles[steamId64]));
    profilesToFetch.add(steamId64);

    debounceProfilesFetch();
  });
