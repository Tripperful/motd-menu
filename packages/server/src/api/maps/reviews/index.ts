import { MapReviewData } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { getPlayerProfile, getPlayersProfiles } from 'src/steam';
import { mapsReviewsReactionsRouter } from './reactions';

export const reviewsRouter = Router();
reviewsRouter.use('/reactions', mapsReviewsReactionsRouter);

reviewsRouter.get('/:mapName', async (req, res) => {
  const { mapName } = req.params;

  try {
    const reviews = (await db.maps.reviews.get(mapName)) ?? [];

    if (reviews.length > 0) {
      const authorsSteamIds = new Set<string>();

      for (const review of reviews) {
        authorsSteamIds.add(review.steamId);
      }

      const authors = await getPlayersProfiles([...authorsSteamIds]);

      for (const review of reviews) {
        review.author = authors[review.steamId];
      }
    }

    res.status(200).end(JSON.stringify(reviews));
  } catch {
    res.status(500).end();
  }
});

reviewsRouter.get('/player/:steamId', async (req, res) => {
  const { steamId } = req.params;

  try {
    const reviews = (await db.maps.reviews.getByAuthor(steamId)) ?? [];

    if (reviews.length > 0) {
      const author = await getPlayerProfile(steamId);

      for (const review of reviews) {
        review.author = author;
      }
    }

    res.status(200).end(JSON.stringify(reviews));
  } catch {
    res.status(500).end();
  }
});

reviewsRouter.post('/:mapName', async (req, res) => {
  const { mapName } = req.params;
  const review: MapReviewData = req.body;

  const steamId = res.locals.sessionData.steamId;
  review.steamId = steamId;

  try {
    const timestamp = await db.maps.reviews.set(mapName, review);

    review.mapName = mapName;
    review.author = await getPlayerProfile(steamId);
    review.timestamp = Number(timestamp);

    res.status(200).end(JSON.stringify(review));
  } catch {
    res.status(500).end();
  }
});

reviewsRouter.delete('/:mapName/:authorSteamId?', async (req, res) => {
  const { mapName } = req.params;
  let { authorSteamId } = req.params;

  const { steamId, permissions } = res.locals.sessionData;

  authorSteamId ??= steamId;

  if (!(authorSteamId === steamId || permissions.includes('comments_edit'))) {
    return res.status(403).end();
  }

  try {
    await db.maps.reviews.delete(mapName, authorSteamId);

    db.logs.add('menu_delete_review', steamId, {
      mapName,
      steamId: authorSteamId,
    });

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
