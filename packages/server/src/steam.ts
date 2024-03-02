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

export const getPlayersProfiles = async (steamIds64: string[]) => {
  try {
    const res = (await (
      await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
          process.env.MOTD_STEAM_API_KEY
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
  } catch {
    return Object.fromEntries(
      steamIds64.map((steamId) => [
        steamId,
        {
          steamId,
          name: 'Unknown',
          avatar:
            'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
        } as SteamPlayerData,
      ]),
    );
  }
};
