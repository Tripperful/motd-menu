import { NewsData } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { createGlobalState } from './util';
import { getSessionData } from '../useSessionData';

const newsPreviewsState = createGlobalState(async () =>
  motdApi.getNewsPreviews(0),
);

let fetching = false;
export const fetchMoreNewsPreviews = async () => {
  if (fetching) return;
  fetching = true;

  try {
    const cur = await newsPreviewsState.get();
    if (cur.data.length >= cur.total) return;

    const newResults = await motdApi.getNewsPreviews(cur.data.length);

    newsPreviewsState.set({
      data: cur.data.concat(newResults.data),
      total: newResults.total,
      unread: newResults.unread,
    });
  } finally {
    fetching = false;
  }
};

export const useNewsPreviews = () => {
  const state = newsPreviewsState.useExternalState();
  const news = state?.data ?? [];
  const total = state?.total ?? 0;
  const unread = state?.unread ?? 0;

  return {
    news,
    total,
    unread,
    hasMore: news.length < total,
  };
};

const newsState = createGlobalState((id: string) =>
  id
    ? motdApi.getNews(id)
    : ({
        title: '',
        content: '',
        createdOn: Date.now(),
        authorSteamId: getSessionData().steamId,
      } as NewsData),
);

export const useNews = (id: string) => newsState.useExternalState(id);

export const createNews = async (title: string, content: string) => {
  try {
    const news = await motdApi.createNews(title, content);

    await newsState.set(news, news.id);

    await newsPreviewsState.set(async (prev) => {
      prev = await prev;

      return {
        ...prev,
        data: [news, ...prev.data],
        total: prev.total + 1,
        unread: prev.unread + 1,
      };
    });

    return news;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const editNews = async (id: string, title: string, content: string) => {
  try {
    const news = await motdApi.editNews(id, title, content);

    await newsState.set(news, news.id);

    await newsPreviewsState.set(async (prev) => {
      prev = await prev;

      return {
        ...prev,
        data: prev.data.map((n) => (n.id === id ? news : n)),
      };
    });

    return news;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const publishNews = async (id: string) => {
  try {
    await motdApi.publishNews(id);

    await newsState.set(
      async (c) =>
        c ? { ...c, publishedOn: Date.now() } : await motdApi.getNews(id),
      id,
    );

    await newsPreviewsState.set(async (prev) => {
      prev = await prev;
      let news = prev.data.find((n) => n.id === id);

      if (!news) {
        news = await motdApi.getNews(id);

        return {
          ...prev,
          data: [news, ...prev.data],
          total: prev.total + 1,
          unread: prev.unread + 1,
        };
      }

      return {
        ...prev,
        data: prev.data.map((n) =>
          n.id === id ? { ...n, publishedOn: Date.now() } : n,
        ),
      };
    });
  } catch (e) {
    console.error(e);
  }
};

export const markNewsRead = async (id: string) => {
  try {
    await motdApi.markNewsRead(id);

    await newsPreviewsState.set(async (prev) => {
      prev = await prev;

      return {
        ...prev,
        data: prev.data.map((n) =>
          n.id === id ? { ...n, readOn: Date.now() } : n,
        ),
        unread: Math.max(0, prev.unread - 1),
      };
    });
  } catch (e) {
    console.error(e);
  }
};

const deleteLocalNewsItem = async (id: string) => {
  await newsPreviewsState.set(async (prev) => {
    prev = await prev;

    return {
      ...prev,
      data: prev.data.filter((n) => n.id !== id),
      total: prev.total - 1,
      unread:
        prev.unread -
        Math.max(0, prev.data.find((n) => n.id === id)?.readOn ? 0 : 1),
    };
  });
};

export const markNewsHidden = async (id: string) => {
  try {
    await motdApi.markNewsHidden(id);
    await deleteLocalNewsItem(id);
  } catch (e) {
    console.error(e);
  }
};

export const deleteNews = async (id: string) => {
  try {
    await motdApi.deleteNews(id);
    await deleteLocalNewsItem(id);
  } catch (e) {
    console.error(e);
  }
};
