import { ReactionName } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { getSessionData } from '../useSessionData';
import { addNotification } from './notifications';
import { createGlobalState } from './util';

const newsReactionsState = createGlobalState((newsId: string) =>
  motdApi.getNewsReactions(newsId),
);

export const useNewsReactions = (newsId: string) => {
  return newsReactionsState.useExternalState(newsId);
};

export const addNewsReaction = async (newsId: string, name: ReactionName) => {
  try {
    await motdApi.addNewsReaction(newsId, name);

    await newsReactionsState.set(async (reactionsPromise) => {
      const reactions = (await reactionsPromise) ?? [];
      return [...reactions, { name, steamId: getSessionData().steamId }];
    }, newsId);

    addNotification('success', 'Reaction added');
  } catch {
    addNotification('error', 'Failed to add reaction');
  }
};

export const deleteNewsReaction = async (
  newsId: string,
  name: ReactionName,
) => {
  try {
    await motdApi.deleteNewsReaction(newsId, name);

    await newsReactionsState.set(async (reactionsPromise) => {
      const reactions = (await reactionsPromise) ?? [];
      return reactions.filter((r) => r.name !== name);
    }, newsId);

    addNotification('success', 'Reaction removed');
  } catch {
    addNotification('error', 'Failed to remove reaction');
  }
};
