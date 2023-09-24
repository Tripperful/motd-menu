import { MapReviewData } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { getPlayersProfiles } from 'src/steam';

export const reviewsApi = Router();

reviewsApi.get('/:mapName', async (req, res) => {
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

reviewsApi.get('/player/:steamId', async (req, res) => {
  const { steamId } = req.params;

  try {
    const reviews = (await db.maps.reviews.getByAuthor(steamId)) ?? [];

    if (reviews.length > 0) {
      const author = (await getPlayersProfiles([steamId]))[steamId];

      for (const review of reviews) {
        review.author = author;
      }
    }

    res.status(200).end(JSON.stringify(reviews));
  } catch {
    res.status(500).end();
  }
});

reviewsApi.post('/:mapName', async (req, res) => {
  const { mapName } = req.params;
  const review: MapReviewData = req.body;

  const steamId = res.locals.sessionData.steamId;
  review.steamId = steamId;

  try {
    const timestamp = await db.maps.reviews.set(mapName, review);

    review.mapName = mapName;
    review.author = (await getPlayersProfiles([steamId]))[steamId];
    review.timestamp = Number(timestamp);

    res.status(200).end(JSON.stringify(review));
  } catch {
    res.status(500).end();
  }
});

reviewsApi.delete('/:mapName/:authorSteamId?', async (req, res) => {
  const { mapName } = req.params;
  let { authorSteamId } = req.params;

  const { steamId, permissions } = res.locals.sessionData;

  authorSteamId ??= steamId;

  if (!(authorSteamId === steamId || permissions.includes('maps_edit'))) {
    return res.status(403).end();
  }

  try {
    await db.maps.reviews.delete(mapName, authorSteamId);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
