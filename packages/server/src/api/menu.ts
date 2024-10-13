import { Router } from 'express';

export const menuRouter = Router();

menuRouter.post('/close', async (_req, res) => {
  try {
    const {
      srcds,
      sessionData: { token },
    } = res.locals;

    srcds.send('motd_close', token);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

menuRouter.post('/clientExec', async (req, res) => {
  try {
    const {
      srcds,
      sessionData: { steamId },
    } = res.locals;

    const { command } = req.body;
    srcds.send('client_cexec', { steamId, command });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

menuRouter.post('/voteSpec/:targetSteamId', async (req, res) => {
  try {
    const {
      srcds,
      sessionData: { steamId },
    } = res.locals;

    const targetSteamId = req.params.targetSteamId;
    const players = await srcds.request('get_players_request');
    const voters = players
      .filter(
        (p) =>
          p.steamId !== steamId &&
          p.teamIdx !== 1 &&
          p.steamId !== targetSteamId,
      )
      .map((p) => p.steamId);

    if (voters.length > 0) {
      srcds.send('motd_open', {
        clients: voters,
        url: 'vote/spec/' + targetSteamId,
      });
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
