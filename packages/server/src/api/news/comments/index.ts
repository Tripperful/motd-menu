import { Router } from 'express';
import { db } from 'src/db';
import { newsCommentsReactionsRouter } from './reactions';

export const newsCommentsRouter = Router();

newsCommentsRouter.use('/reactions', newsCommentsReactionsRouter);

newsCommentsRouter.get('/:newsId', async (req, res) => {
  try {
    const { newsId } = req.params;

    const comments = await db.news.comments.get(newsId);

    res.status(200).json(comments);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsCommentsRouter.post('/:newsId', async (req, res) => {
  try {
    const { newsId } = req.params;
    const {
      sessionData: { steamId },
    } = res.locals;
    const { content } = req.body;

    const commentId = await db.news.comments.add(newsId, steamId, content);

    res.status(200).json({ commentId });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsCommentsRouter.put('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const { steamId } = res.locals.sessionData;

    const comment = await db.news.comments.getById(commentId);

    if (!comment) {
      res.status(404).end();
      return;
    }

    if (comment.steamId !== steamId) {
      res.status(403).end();
      return;
    }

    await db.news.comments.edit(commentId, content);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsCommentsRouter.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { steamId, permissions } = res.locals.sessionData;

    const comment = await db.news.comments.getById(commentId);

    if (!comment) {
      res.status(404).end();
      return;
    }

    if (
      !(comment.steamId === steamId || permissions.includes('comments_edit'))
    ) {
      res.status(403).end();
      return;
    }

    await db.news.comments.delete(commentId);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
