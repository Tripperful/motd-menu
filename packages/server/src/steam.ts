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

const errorProfile = (steamId: string) =>
  ({
    steamId,
    name: steamId,
    avatar:
      'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  }) as SteamPlayerData;

export const getPlayersProfilesNoBatch = async (steamIds64: string[]) => {
  try {
    // Steam API only allows requesting up to 100 profiles at once
    const batches = Array.from(
      { length: Math.ceil(steamIds64.length / 100) },
      (_, i) => steamIds64.slice(i * 100, i * 100 + 100),
    );

    const profilesBySteamId: Record<string, PlayerSummary> = {};

    await Promise.all(
      batches.map((batch) =>
        fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
            process.env.MOTD_STEAM_API_KEY
          }&steamids=${batch.join(',')}`,
        )
          .then((r) => r.json())
          .then((r: GetPlayerSummariesResponse) => {
            for (const player of r.response.players) {
              profilesBySteamId[player.steamid] = player;
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
  const profiles = await getPlayersProfilesNoBatch(Array.from(profilesToFetch));

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
    profilesCallbacks.push((profiles) =>
      resolve(profiles[steamId64] ?? errorProfile(steamId64)),
    );
    profilesToFetch.add(steamId64);

    debounceProfilesFetch();
  });
