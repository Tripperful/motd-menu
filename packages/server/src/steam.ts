import { SteamPlayerData } from '@motd-menu/common';

interface PlayerSummary {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

interface GetPlayerSummariesResponse {
  response: {
    players: PlayerSummary[];
  };
}

const profileCacheLifetime = 1000 * 60 * 10; // 10 min

const playersProfilesCache: Record<
  string,
  {
    lastUpdate: number;
    data: PlayerSummary;
  }
> = {};

const errorProfile = (steamId: string) =>
  ({
    steamId,
    name: steamId,
    avatar:
      'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  }) as SteamPlayerData;

export const getPlayersProfilesNoBatch = async (steamIds64: string[]) => {
  try {
    const profilesBySteamId: Record<string, PlayerSummary> = {};

    let cachedSteamIds: string[] = [];
    let uncachedSteamIds: string[] = [];

    for (const steamId of steamIds64) {
      const cache = playersProfilesCache[steamId];
      const now = Date.now();

      if (cache && cache.lastUpdate > now - profileCacheLifetime) {
        profilesBySteamId[steamId] = cache.data;
        cachedSteamIds.push(steamId);
      } else {
        uncachedSteamIds.push(steamId);
      }
    }

    // Steam API only allows requesting up to 100 profiles at once
    const batches = Array.from(
      { length: Math.ceil(uncachedSteamIds.length / 100) },
      (_, i) => uncachedSteamIds.slice(i * 100, i * 100 + 100),
    );

    await Promise.all(
      batches.map((batch) =>
        fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
            process.env.MOTD_STEAM_API_KEY
          }&steamids=${batch.join(',')}`,
        )
          .then((r) => r.json())
          .then((r: GetPlayerSummariesResponse) => {
            const lastUpdate = Date.now();

            for (const player of r.response.players) {
              profilesBySteamId[player.steamid] = player;
              playersProfilesCache[player.steamid] = {
                lastUpdate,
                data: player,
              };
            }
          }),
      ),
    );

    return Object.fromEntries(
      steamIds64.map((steamId) => {
        const profile = profilesBySteamId[steamId];

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
  let profiles: Record<string, SteamPlayerData>;
  try {
    profiles = await getPlayersProfilesNoBatch(Array.from(profilesToFetch));
  } catch {
    profiles = Object.fromEntries(
      Array.from(profilesToFetch).map((id) => [id, errorProfile(id)]),
    );
  }

  fetchTimeout = null;

  for (const cb of profilesCallbacks) {
    cb(profiles);
  }

  profilesToFetch.clear();
  profilesCallbacks.length = 0;
};

const debounceProfilesFetch = () => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
  }

  fetchTimeout = setTimeout(flushProfiles, 100);
};

export const getPlayersProfiles = async (steamIds64: string[]) =>
  new Promise<Record<string, SteamPlayerData>>((resolve) => {
    for (const id of steamIds64) {
      profilesToFetch.add(id);
    }

    profilesCallbacks.push((profiles) => {
      const requestedProfiles = Object.fromEntries(
        steamIds64.map((id) => [id, profiles[id]]),
      );

      resolve(requestedProfiles);
    });

    debounceProfilesFetch();
  });

export const getPlayerProfile = async (steamId64: string) =>
  new Promise<SteamPlayerData>((resolve) => {
    profilesCallbacks.push((profiles) =>
      resolve(profiles[steamId64] ?? errorProfile(steamId64)),
    );
    profilesToFetch.add(steamId64);

    debounceProfilesFetch();
  });
