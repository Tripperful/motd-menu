import { NewsCommentData } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { getSessionData } from '../useSessionData';
import { addNotification } from './notifications';
import { createGlobalState } from './util';

const newsCommentsState = createGlobalState(async (newsId: string) =>
  motdApi.getNewsComments(newsId),
);

export const useNewsComments = (newsId: string) => {
  return newsCommentsState.useExternalState(newsId);
};

export const addNewsComment = async (newsId: string, content: string) => {
  try {
    const id = await motdApi.addNewsComment(newsId, content);

    await newsCommentsState.set(async (commentsPromise) => {
      const comments = (await commentsPromise) ?? [];
      return [
        ...comments,
        {
          id,
          steamId: getSessionData().steamId,
          content,
          createdOn: Date.now(),
        } as NewsCommentData,
      ];
    }, newsId);

    addNotification('success', 'Comment added');
  } catch {
    addNotification('error', 'Failed to add comment');
  }
};

export const editNewsComment = async (
  newsId: string,
  commentId: string,
  content: string,
) => {
  try {
    await motdApi.editNewsComment(commentId, content);

    await newsCommentsState.set(async (commentsPromise) => {
      const comments = (await commentsPromise) ?? [];
      return comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              content,
            }
          : c,
      );
    }, newsId);

    addNotification('success', 'Comment edited');
  } catch {
    addNotification('error', 'Failed to edit comment');
  }
};

export const deleteNewsComment = async (newsId: string, commentId: string) => {
  try {
    await motdApi.deleteNewsComment(commentId);

    await newsCommentsState.set(async (commentsPromise) => {
      const comments = (await commentsPromise) ?? [];
      return comments.filter((c) => c.id !== commentId);
    }, newsId);

    addNotification('success', 'Comment deleted');
  } catch {
    addNotification('error', 'Failed to delete comment');
  }
};
