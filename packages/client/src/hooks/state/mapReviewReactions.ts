import { ReactionName } from '@motd-menu/common';
import { useCallback } from 'react';
import { motdApi } from 'src/api';
import { useMySteamId } from '../useMySteamId';
import { usePlayerProfile } from './players';
import { createGlobalState } from './util';

const packKey = (mapName: string, reviewAuthorSteamId: string) =>
  mapName + ' ' + reviewAuthorSteamId;

const unpackKey = (key: string) => {
  const [mapName, reviewAuthorSteamId] = key.split(' ');

  return { mapName, reviewAuthorSteamId };
};

const mapReviewReactionsState = createGlobalState((key: string) => {
  const { mapName, reviewAuthorSteamId } = unpackKey(key);

  return motdApi.getMapReviewReactions(mapName, reviewAuthorSteamId);
});

export const useMapReviewReactions = (
  mapName: string,
  reviewAuthorSteamId: string,
) =>
  mapReviewReactionsState.useExternalState(
    packKey(mapName, reviewAuthorSteamId),
  );

export const useAddRemoveMapReviewReaction = (
  mapName: string,
  reviewAuthorSteamId: string,
) => {
  const steamId = useMySteamId();
  const author = usePlayerProfile(steamId);

  const add = useCallback(
    (name: ReactionName) => {
      mapReviewReactionsState.set(
        async (cur) => [
          ...((await cur) ?? []),
          {
            name,
            steamId,
            author,
          },
        ],
        packKey(mapName, reviewAuthorSteamId),
      );
    },
    [author, mapName, reviewAuthorSteamId, steamId],
  );

  const remove = useCallback(
    (name: ReactionName) => {
      mapReviewReactionsState.set(
        async (cur) =>
          ((await cur) ?? []).filter(
            (reaction) =>
              !(reaction.author?.steamId === steamId && reaction.name === name),
          ),
        packKey(mapName, reviewAuthorSteamId),
      );
    },
    [mapName, reviewAuthorSteamId, steamId],
  );

  return [add, remove] as const;
};
