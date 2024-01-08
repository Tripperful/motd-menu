import { ReactionName } from '@motd-menu/common';
import { useCallback } from 'react';
import { motdApi } from 'src/api';
import { useMySteamId } from '../useMySteamId';
import { usePlayerProfile } from './players';
import { createGlobalState } from './util';

const mapReactionsState = createGlobalState((mapName: string) =>
  motdApi.getMapReactions(mapName),
);

export const useMapReactions = (mapName: string) =>
  mapReactionsState.useExternalState(mapName);

export const useAddRemoveMapReaction = (mapName: string) => {
  const steamId = useMySteamId();
  const author = usePlayerProfile(steamId);

  const add = useCallback(
    (name: ReactionName) => {
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
    },
    [author, mapName, steamId],
  );

  const remove = useCallback(
    (name: ReactionName) => {
      mapReactionsState.set(
        async (cur) =>
          ((await cur) ?? []).filter(
            (reaction) =>
              !(reaction.author?.steamId === steamId && reaction.name === name),
          ),
        mapName,
      );
    },
    [mapName, steamId],
  );

  return [add, remove] as const;
};
