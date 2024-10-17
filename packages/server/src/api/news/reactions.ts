import { ReactionName } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const newsReactionsRouter = Router();

newsReactionsRouter.get('/:newsId', async (req, res) => {
  try {
    const { newsId } = req.params;

    const reactions = await db.news.reactions.get(newsId);

    res.status(200).end(JSON.stringify(reactions));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsReactionsRouter.post('/:newsId/:reaction', async (req, res) => {
  try {
    const { newsId, reaction } = req.params;
    const { steamId } = res.locals.sessionData;

    await db.news.reactions.add(newsId, steamId, reaction as ReactionName);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsReactionsRouter.delete('/:newsId/:reaction', async (req, res) => {
  try {
    const { newsId, reaction } = req.params;
    const { steamId } = res.locals.sessionData;

    await db.news.reactions.delete(newsId, steamId, reaction as ReactionName);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
