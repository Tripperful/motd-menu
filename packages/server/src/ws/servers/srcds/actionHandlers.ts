import { chatColor, supportedLanguages } from '@motd-menu/common';
import { dropAuthCache } from 'src/auth';
import { db } from 'src/db';
import { matchCounter, onlinePlayersGauge } from 'src/metrics';
import { getPlayerProfile } from 'src/steam';
import { dbgErr, dbgWarn } from 'src/util';
import { EfpsClient } from 'src/util/efps';
import { getTranslator } from 'src/util/language';
import { getRankData, toSrcdsRankData } from 'src/util/ranks';
import { SrcdsWsApiServer } from './SrcdsWsApiServer';
import { chargerUseHandler } from './chargerUseHandler';

const srcdsWsServer = SrcdsWsApiServer.getInstace();

srcdsWsServer.onMessage('player_disconnected', async (srcds, data) => {
  srcds
    .request('get_players_request')
    .then((players) => {
      onlinePlayersGauge.set(
        {
          server: srcds.getInfo().name ?? 'unknown',
        },
        players?.length ?? 0,
      );
    })
    .catch(() => {});

  const { token, connectionStats: s } = data;

  dropAuthCache(token);

  db.client.disconnected(
    token,
    s.in.avglatency,
    s.in.avgloss,
    s.in.avgchoke,
    s.in.avgpackets,
    s.in.totaldata,
    s.out.avglatency,
    s.out.avgloss,
    s.out.avgchoke,
    s.out.avgpackets,
    s.out.totaldata,
  );
});

srcdsWsServer.onMessage('player_chat', async (srcds, data) => {
  const { steamId, msg, teamIdx, matchId } = data;

  db.chat
    .addMessage(steamId, msg, srcds.getInfo().id, teamIdx ?? 0, matchId ?? null)
    .catch(dbgErr);

  (async () => {
    const translator = getTranslator();
    if (!translator) return;

    const players = await srcds.request('get_players_request');

    const playersLanguages: Record<string, string[]> = {};

    await Promise.all(
      players
        .filter((p) => p.steamId !== steamId)
        .map(async (player) => {
          const [settings, languages] = await Promise.all([
            db.client.settings.getValues(player.steamId),
            db.chat.getPreferredLanguages(player.steamId),
          ]);

          if (settings?.translateChat && languages?.length > 0) {
            playersLanguages[player.steamId] = languages;
          }
        }),
    );

    const [{ language: detectedLanguage }] = await translator.detect(msg);

    if (!supportedLanguages[detectedLanguage]) return;

    const targetTranslations = new Set<string>();

    for (const [, languages] of Object.entries(playersLanguages)) {
      if (!languages.includes(detectedLanguage)) {
        targetTranslations.add(languages[0]);
      }
    }

    const translationsByLanguage: Record<string, string> = {};

    await Promise.all(
      Array.from(targetTranslations).map(async (mainLanguage) => {
        const [translation] = await translator.translate(msg, mainLanguage);
        translationsByLanguage[mainLanguage] = translation;
      }),
    );

    const sender = await getPlayerProfile(steamId);

    for (const [language, translation] of Object.entries(
      translationsByLanguage,
    )) {
      const clients = Object.keys(playersLanguages).filter(
        (steamId) => playersLanguages[steamId][0] === language,
      );

      srcds.send('chat_print', {
        clients,
        text: `${chatColor.MOTD}[${detectedLanguage.toUpperCase()} ➔ ${language.toUpperCase()}] ${chatColor.Yellow}${sender.name}: ${chatColor.White}${translation}`,
      });
    }
  })().catch(dbgWarn);

  if (msg.startsWith('@') && msg.length > 1) {
    const servers = SrcdsWsApiServer.getInstace().getConnectedClients();
    const playerData = await getPlayerProfile(steamId);

    await Promise.allSettled(
      servers.map(async (server) => {
        const [serverPlayers, { participants }] = await Promise.all([
          server.request('get_players_request'),
          server.request('get_match_state_request'),
        ]);

        let clients: string[] = serverPlayers.map((p) => p.steamId);

        if (server.getId() !== srcds.getId() && participants?.length) {
          clients = clients.filter((client) => !participants.includes(client));
        }

        let text = `${chatColor.MOTD}[${srcds.getInfo().name}]`;
        text += `${chatColor.Yellow} ${playerData.name}: `;
        text += msg.slice(1).trim();

        server.send('chat_print', {
          clients,
          text,
        });
      }),
    );
  }

  const cmd = msg.toLowerCase();

  if (cmd === '!votespec') {
    const players = await srcds.request('get_players_request');
    const callee = players.find((p) => p.steamId === steamId);

    if (callee?.teamIdx === 1) return;

    const isMatch =
      (await srcds.request('get_cvars_request', ['mp_match'])).mp_match !== '0';

    if (isMatch) return;

    srcds.send('motd_open', {
      url: 'vote/spec',
      clients: [steamId],
    });
  }
});

srcdsWsServer.onMessage('client_cvars', async (srcds, data) => {
  const { steamId, cvars } = data;

  await db.client.saveCvars(steamId, cvars);
});

srcdsWsServer.onMessage('set_client_settings', async (srcds, data) => {
  const { steamId, settings } = data;

  await db.client.settings.setValues(steamId, settings);
});

srcdsWsServer.onMessage('match_started', async (srcds, data) => {
  db.matchStats.matchStarted(srcds.getInfo().id, data);

  const { isDev } = await db.server.getById(srcds.getInfo().id);

  if (!isDev) {
    EfpsClient.getInstance()?.notifyMatchStarted({
      id: data.id,
      map: data.mapName,
      players: data.teams.flatMap((team) =>
        team.players.map((steamid) => ({
          steamid,
          teamid: team.index,
        })),
      ),
      server: srcds.getInfo().name,
      teamplay: data.teams.length > 1,
    });
  }
});

srcdsWsServer.onMessage('match_ended', async (srcds, data) => {
  await db.matchStats.matchEnded(data);
  const { isDev } = await db.server.getById(srcds.getInfo().id);

  const status = data.status;

  matchCounter.inc({
    map: data.mapName,
    status,
  });

  if (process.env.MOTD_EFPS_KEY) {
    if (status === 'completed') {
      if (!isDev) {
        await EfpsClient.getInstance()?.sendMatch(data.id);
      }

      const servers = SrcdsWsApiServer.getInstace().getConnectedClients();

      await Promise.allSettled(
        servers.map(async (connectedSrcds) => {
          const players = await connectedSrcds.request('get_players_request');

          const playersRanks = (
            await Promise.all(
              players.map((player) => getRankData(player.steamId)),
            )
          ).filter(Boolean);

          await db.matchStats.updateAfterMatchRanks(data.id, playersRanks);
          connectedSrcds.send(
            'rank_update',
            playersRanks.map((rank) => {
              const rankUpdateData = toSrcdsRankData(rank);
              rankUpdateData.show = true;

              return rankUpdateData;
            }),
          );
        }),
      );
    } else {
      if (!isDev) {
        EfpsClient.getInstance()?.notifyMatchCanceled(data.id);
      }
    }
  }
});

srcdsWsServer.onMessage('player_death', (srcds, data) =>
  db.matchStats.playerDeath(data),
);

srcdsWsServer.onMessage('player_respawn', (srcds, data) =>
  db.matchStats.playerRespawn(data),
);

srcdsWsServer.onMessage('player_damage', (srcds, data) =>
  db.matchStats.playerDamage(data),
);

srcdsWsServer.onMessage('item_respawn', (srcds, data) =>
  db.matchStats.itemRespawn(data),
);

srcdsWsServer.onMessage('item_pickup', (srcds, data) =>
  db.matchStats.itemPickup(data),
);

srcdsWsServer.onMessage('player_attack', (srcds, data) =>
  db.matchStats.playerAttack(data),
);

srcdsWsServer.onMessage('ammo_pickup', (srcds, data) =>
  db.matchStats.ammoPickup(data),
);

srcdsWsServer.onMessage('weapon_drop', (srcds, data) =>
  db.matchStats.weaponDrop(data),
);

srcdsWsServer.onMessage('medkit_pickup', (srcds, data) =>
  db.matchStats.medkitPickup(data),
);

srcdsWsServer.onMessage('battery_pickup', (srcds, data) =>
  db.matchStats.batteryPickup(data),
);

srcdsWsServer.onMessage('charger_use', (srcds, data) =>
  chargerUseHandler(data),
);

srcdsWsServer.onMessage('projectile_spawn', (srcds, data) =>
  db.matchStats.projectileSpawn(data),
);

srcdsWsServer.onMessage('projectile_death', (srcds, data) =>
  db.matchStats.projectileDeath(data),
);

srcdsWsServer.onMessage('projectile_bounce', (srcds, data) =>
  db.matchStats.projectileBounce(data),
);

srcdsWsServer.onMessage('projectile_owner_change', (srcds, data) =>
  db.matchStats.projectileOwnerChange(data),
);

srcdsWsServer.onMessage('projectile_lifetime_reset', (srcds, data) =>
  db.matchStats.projectileLifetimeReset(data),
);

srcdsWsServer.onMessage('ent_teleport', (srcds, data) =>
  db.matchStats.entityTeleport(data),
);

srcdsWsServer.onMessage('player_substitution', (srcds, data) =>
  db.matchStats.playerSubstitution(data),
);
