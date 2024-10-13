import { Router } from 'express';
import { db } from 'src/db';
import { mapsReactionsRouter } from './reactions';
import { reviewsRouter } from './reviews';

export const mapsRouter = Router();

mapsRouter.use('/reviews', reviewsRouter);
mapsRouter.use('/reactions', mapsReactionsRouter);

mapsRouter.get('/', async (_req, res) => {
  try {
    const {
      srcds,
      sessionData: { steamId },
    } = res.locals;

    const mapNames = await srcds.request('get_maps_request');

    await db.maps.init(mapNames);

    const mapPreviews = (await db.maps.get(steamId)).filter((p) =>
      mapNames.includes(p.name),
    );

    for (const preview of mapPreviews) {
      if (preview.parentMap && !mapNames.includes(preview.parentMap)) {
        delete preview.parentMap;
      }
    }

    res.status(200).end(JSON.stringify(mapPreviews));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.get('/:mapName', async (req, res) => {
  try {
    res
      .status(200)
      .end(
        JSON.stringify(
          await db.maps.get(res.locals.sessionData.steamId, req.params.mapName),
        ),
      );
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.post('/parent/:mapName/:parentMapName', async (req, res) => {
  try {
    const { mapName, parentMapName } = req.params;

    if (mapName === parentMapName) {
      res.status(400).end();
      return;
    }

    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('maps_edit')) {
      res.status(403).end();
      return;
    }

    await db.maps.setParent(mapName, parentMapName);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.delete('/parent/:mapName', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('maps_edit')) {
      res.status(403).end();
      return;
    }

    await db.maps.setParent(req.params.mapName, null);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.post('/description/:mapName', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('maps_edit')) {
      res.status(403).end();
      return;
    }

    await db.maps.setDescription(req.params.mapName, req.body);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.post('/images/:mapName', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('maps_edit')) {
      res.status(403).end();
      return;
    }

    await db.maps.setImages(req.params.mapName, req.body);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.post('/tags/:mapName', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('maps_edit')) {
      res.status(403).end();
      return;
    }

    await db.maps.setTags(req.params.mapName, req.body);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.delete('/tags/:tag', async (req, res) => {
  try {
    const { permissions } = res.locals.sessionData;

    if (!permissions.includes('maps_edit')) {
      res.status(403).end();
      return;
    }

    await db.maps.deleteTag(req.params.tag);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.post('/favorite/:mapName', async (req, res) => {
  try {
    const {
      sessionData: { steamId },
    } = res.locals;

    await db.maps.setFavorite(req.params.mapName, steamId, true);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.delete('/favorite/:mapName', async (req, res) => {
  try {
    const {
      sessionData: { steamId },
    } = res.locals;

    await db.maps.setFavorite(req.params.mapName, steamId, false);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

mapsRouter.post('/changelevel/:mapName', async (req, res) => {
  try {
    const {
      srcds,
      sessionData: { token, steamId },
    } = res.locals;

    const { mapName } = req.params;

    srcds.send('changelevel', { mapName, token });

    db.logs.add('menu_map_change', steamId, { mapName });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
