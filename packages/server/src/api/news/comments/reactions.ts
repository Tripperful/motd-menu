import { ReactionName } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const newsCommentsReactionsRouter = Router();

newsCommentsReactionsRouter.get('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;

    const reactions = await db.news.comments.reactions.get(commentId);

    res.status(200).end(JSON.stringify(reactions));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsCommentsReactionsRouter.post('/:commentId/:reaction', async (req, res) => {
  try {
    const { commentId, reaction } = req.params;
    const { steamId } = res.locals.sessionData;

    await db.news.comments.reactions.add(
      commentId,
      steamId,
      reaction as ReactionName,
    );

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsCommentsReactionsRouter.delete(
  '/:commentId/:reaction',
  async (req, res) => {
    try {
      const { commentId, reaction } = req.params;
      const { steamId } = res.locals.sessionData;

      await db.news.comments.reactions.delete(
        commentId,
        steamId,
        reaction as ReactionName,
      );

      res.status(200).end();
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  },
);
