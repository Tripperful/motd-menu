import { Router } from 'express';
import { db } from 'src/db';
import { newsCommentsRouter } from './comments';
import { newsReactionsRouter } from './reactions';

export const newsRouter = Router();

newsRouter.use('/comments', newsCommentsRouter);
newsRouter.use('/reactions', newsReactionsRouter);

newsRouter.get('/previews/:offset', async (req, res) => {
  try {
    const { offset } = req.params;
    const searchText = req.query?.searchText as string;

    const {
      sessionData: { steamId },
    } = res.locals;

    const newsPreviews = await db.news.getPreviews(
      steamId,
      50,
      Number(offset),
      searchText,
    );

    res.status(200).json(newsPreviews);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sessionData: { steamId },
    } = res.locals;

    const news = await db.news.getById(id, steamId);

    res.status(200).json(news);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsRouter.post('/', async (req, res) => {
  try {
    const {
      sessionData: { steamId, permissions },
    } = res.locals;

    if (!permissions.includes('news_create')) {
      res.status(403).end();
      return;
    }

    const { title, content } = req.body;

    const newsId = await db.news.create(steamId, title, content);
    const news = await db.news.getById(newsId, steamId);

    res.status(200).json(news);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sessionData: { steamId, permissions },
    } = res.locals;

    if (!permissions.includes('news_create')) {
      res.status(403).end();
      return;
    }

    const { title, content } = req.body;

    await db.news.edit(id, title, content);
    const news = await db.news.getById(id, steamId);

    res.status(200).json(news);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsRouter.post('/publish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sessionData: { permissions },
    } = res.locals;

    if (!permissions.includes('news_publish')) {
      res.status(403).end();
      return;
    }

    await db.news.publish(id);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsRouter.post('/markRead/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sessionData: { steamId },
    } = res.locals;

    await db.news.markRead(id, steamId);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsRouter.post('/markHidden/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sessionData: { steamId },
    } = res.locals;

    await db.news.markHidden(id, steamId);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

newsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      sessionData: { permissions },
    } = res.locals;

    if (!permissions.includes('news_create')) {
      res.status(403).end();
      return;
    }

    await db.news.delete(id);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
