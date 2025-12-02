import { chatColor, PlayerChatData } from '@motd-menu/common';
import { SrcdsWsApiClient } from './SrcdsWsApiClient';
import { db } from 'src/db';

export const handleChatCommand: (
  steamId: string,
  cmd: string,
  data: PlayerChatData,
  srcds: SrcdsWsApiClient,
) => Promise<boolean> = async (steamId, cmdText, data, srcds) => {
  const players = await srcds.request('get_players_request');
  const callee = players.find((p) => p.steamId === steamId);
  const isMatch =
    (await srcds.request('get_cvars_request', ['mp_match'])).mp_match !== '0';

  if (isMatch || callee?.teamIdx === 1) return;

  const args = cmdText
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  const cmd = args.shift();

  switch (cmd) {
    case 'votespec':
      srcds.send('motd_open', {
        url: 'vote/spec',
        clients: [steamId],
      });
      return true;
    case 'random':
      try {
        let maps = await srcds.request('get_maps_request');

        if (args.length > 0) {
          const unfilteredMaps = maps;
          maps = [];

          await Promise.all(
            unfilteredMaps.map(async (map) => {
              const mapTags = (await db.maps.get(steamId, map))?.tags;

              if (mapTags.some((tag) => args.includes(tag))) {
                maps.push(map);
              }
            }),
          );
        }

        const clients = players.map((p) => p.steamId);

        if (maps.length === 0) {
          srcds.send('chat_print', {
            clients,
            text: `${chatColor.Info}No maps found with the specified tags.`,
          });
          return true;
        }

        const randomMap = maps[Math.floor(Math.random() * maps.length)];

        srcds.send('chat_print', {
          clients,
          text: `${chatColor.Info}Random map selected: ${chatColor.Value}${randomMap}`,
        });

        srcds.send('motd_open', {
          url: `maps/${randomMap}`,
          clients: [steamId],
        });

        return true;
      } catch {
        return false;
      }

    default:
      return false;
  }
};
