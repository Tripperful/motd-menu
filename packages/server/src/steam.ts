import { errorSteamProfile, SteamPlayerData } from '@motd-menu/common';
import { parseStringPromise as xmlParse } from 'xml2js';
import { getGeoDataBySteamId } from './util/countries';

const profileCacheLifetime = 1000 * 60 * 10; // 10 min

const playersProfilesCache: Record<
  string,
  {
    lastUpdate: number;
    data: SteamPlayerData;
  }
> = {};

export const getPlayersProfiles = async (
  steamIds64: string[],
  includeCity = false,
) =>
  Object.fromEntries(
    await Promise.all(
      steamIds64.map(async (steamId64) => [
        steamId64,
        await getPlayerProfile(steamId64, includeCity),
      ]),
    ),
  ) as Record<string, SteamPlayerData>;

export const getPlayerProfile = async (
  steamId64: string,
  includeCity = false,
): Promise<SteamPlayerData> => {
  try {
    const cached = playersProfilesCache[steamId64];

    let profile: SteamPlayerData = null;

    if (cached && cached.lastUpdate > Date.now() - profileCacheLifetime) {
      profile = cached.data;
    } else {
      const res = await fetch(
        `https://steamcommunity.com/profiles/${steamId64}/?xml=1`,
      );
      const xml = await res.text();
      const json = await xmlParse(xml, {
        explicitArray: false,
        mergeAttrs: true,
      });

      const errorProfile = errorSteamProfile(steamId64);

      profile = {
        avatar: json.profile?.avatarFull ?? errorProfile.avatar,
        name: json.profile?.steamID ?? errorProfile.name,
        steamId: json.profile?.steamID64 ?? errorProfile.steamId,
      };

      playersProfilesCache[steamId64] = {
        lastUpdate: Date.now(),
        data: profile,
      };
    }

    const geo = await getGeoDataBySteamId(steamId64);

    return {
      ...profile,
      geo: includeCity
        ? geo
        : {
            country: geo.country,
            countryCode: geo.countryCode,
            full: geo.country,
          },
    };
  } catch {
    return errorSteamProfile(steamId64);
  }
};
