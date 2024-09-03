import { Router } from 'express';

export const menuRouter = Router();

menuRouter.post('/close', async (_req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { token },
    } = res.locals;

    srcdsApi.closeMenu(token);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

menuRouter.post('/clientExec', async (req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { steamId },
    } = res.locals;

    const { command } = req.body;
    srcdsApi.clientExec(steamId, command);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

menuRouter.post('/voteSpec/:targetSteamId', async (req, res) => {
  try {
    const {
      srcdsApi,
      sessionData: { steamId },
    } = res.locals;

    const targetSteamId = req.params.targetSteamId;
    const players = await srcdsApi.getOnlinePlayers();
    const voters = players
      .filter(
        (p) =>
          p.steamId !== steamId &&
          p.teamIdx !== 1 &&
          p.steamId !== targetSteamId,
      )
      .map((p) => p.steamId);

    if (voters.length > 0) {
      srcdsApi.openMenu(voters, 'vote/spec/' + targetSteamId);
    }

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

menuRouter.get('/tgLink', async (_req, res) => {
  try {
    const {
      tgService,
      sessionData: { steamId },
    } = res.locals;

    const link = (await tgService?.getJoinLink(steamId)) ?? null;

    res.json({ link });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
