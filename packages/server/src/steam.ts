import fetch from 'node-fetch';
import { SteamPlayerData } from '@motd-menu/common';
import { config } from '~root/config';

interface GetPlayerSummariesResponse {
  response: {
    players: {
      steamid: string;
      personaname: string;
      avatarfull: string;
    }[];
  };
}

export const getPlayersProfiles = async (steamIds64: string[]) => {
  const res = (await (
    await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
        config.steamWebApiKey
      }&steamids=${steamIds64.join(',')}`,
    )
  ).json()) as GetPlayerSummariesResponse;

  return Object.fromEntries(
    res.response.players.map(
      ({ steamid: steamId, personaname: name, avatarfull: avatar }) => [
        steamId,
        {
          steamId,
          name,
          avatar,
        } as SteamPlayerData,
      ],
    ),
  );
};
