import { ReactionName } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { useMySteamId } from '../useMySteamId';
import { usePlayerProfile } from './players';
import { createGlobalState } from './util';

const mapReactionsState = createGlobalState((mapName: string) =>
  motdApi.getMapReactions(mapName),
);

export const useMapReactions = (mapName: string) =>
  mapReactionsState.useExternalState(mapName);

export const useAddMapReaction = (mapName: string) => {
  const steamId = useMySteamId();
  const author = usePlayerProfile(steamId);

  return (name: ReactionName) => {
    mapReactionsState.set(
      async (cur) => [
        ...((await cur) ?? []),
        {
          name,
          steamId,
          author,
        },
      ],
      mapName,
    );
  };
};
