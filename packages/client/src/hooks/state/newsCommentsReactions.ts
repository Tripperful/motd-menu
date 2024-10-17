import { ReactionName } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { getSessionData } from '../useSessionData';
import { addNotification } from './notifications';
import { createGlobalState } from './util';

const newsCommentsReactionsState = createGlobalState((commentId: string) =>
  motdApi.getNewsCommentReactions(commentId),
);

export const useNewsCommentReactions = (commentId: string) => {
  return newsCommentsReactionsState.useExternalState(commentId);
};

export const addNewsCommentReaction = async (
  commentId: string,
  name: ReactionName,
) => {
  try {
    await motdApi.addNewsCommentReaction(commentId, name);

    await newsCommentsReactionsState.set(async (reactionsPromise) => {
      const reactions = (await reactionsPromise) ?? [];
      return [...reactions, { name, steamId: getSessionData().steamId }];
    }, commentId);

    addNotification('success', 'Reaction added');
  } catch {
    addNotification('error', 'Failed to add reaction');
  }
};

export const deleteNewsCommentReaction = async (
  commentId: string,
  name: ReactionName,
) => {
  try {
    await motdApi.deleteNewsCommentReaction(commentId, name);

    await newsCommentsReactionsState.set(async (reactionsPromise) => {
      const reactions = (await reactionsPromise) ?? [];
      return reactions.filter((r) => r.name !== name);
    }, commentId);

    addNotification('success', 'Reaction removed');
  } catch {
    addNotification('error', 'Failed to remove reaction');
  }
};
