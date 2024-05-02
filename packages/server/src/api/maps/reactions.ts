import { ReactionName } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';

export const mapsReactionsRouter = Router();

mapsReactionsRouter.get('/:mapName', async (req, res) => {
  const { mapName } = req.params;

  try {
    const reactions = (await db.maps.reactions.get(mapName)) ?? [];

    res.status(200).end(JSON.stringify(reactions));
  } catch {
    res.status(500).end();
  }
});

mapsReactionsRouter.post('/:mapName/:reactionName', async (req, res) => {
  const { mapName, reactionName } = req.params;

  try {
    await db.maps.reactions.add(
      mapName,
      res.locals.sessionData.steamId,
      reactionName as ReactionName,
    );

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});

mapsReactionsRouter.delete('/:mapName/:reactionName', async (req, res) => {
  const { mapName, reactionName } = req.params;

  try {
    await db.maps.reactions.delete(
      mapName,
      res.locals.sessionData.steamId,
      reactionName as ReactionName,
    );

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
