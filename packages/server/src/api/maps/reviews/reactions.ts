import { ReactionName } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const mapsReviewsReactionsRouter = Router();

mapsReviewsReactionsRouter.get(
  '/:mapName/:reviewAuthorSteamId',
  async (req, res) => {
    const { mapName, reviewAuthorSteamId } = req.params;

    try {
      const reactions =
        (await db.maps.reviews.reactions.get(mapName, reviewAuthorSteamId)) ??
        [];

      res.status(200).end(JSON.stringify(reactions));
    } catch {
      res.status(500).end();
    }
  },
);

mapsReviewsReactionsRouter.post(
  '/:mapName/:reviewAuthorSteamId/:reactionName',
  async (req, res) => {
    const { mapName, reviewAuthorSteamId, reactionName } = req.params;

    try {
      await db.maps.reviews.reactions.add(
        mapName,
        reviewAuthorSteamId,
        res.locals.sessionData.steamId,
        reactionName as ReactionName,
      );

      res.status(200).end();
    } catch {
      res.status(500).end();
    }
  },
);

mapsReviewsReactionsRouter.delete(
  '/:mapName/:reviewAuthorSteamId/:reactionName',
  async (req, res) => {
    const { mapName, reviewAuthorSteamId, reactionName } = req.params;

    try {
      await db.maps.reviews.reactions.delete(
        mapName,
        reviewAuthorSteamId,
        res.locals.sessionData.steamId,
        reactionName as ReactionName,
      );

      res.status(200).end();
    } catch {
      res.status(500).end();
    }
  },
);
