import { chatColor, PlayerClientSettings } from '@motd-menu/common';
import { dropAuthCache } from 'src/auth';
import { db } from 'src/db';
import { matchCounter, onlinePlayersGauge } from 'src/metrics';
import { getPlayerProfile } from 'src/steam';
import { dbgErr } from 'src/util';
import { EfpsClient } from 'src/util/efps';
import { getRankData, toSrcdsRankData } from 'src/util/ranks';
import { SrcdsWsApiServer } from './SrcdsWsApiServer';
import { chargerUseHandler } from './chargerUseHandler';

const srcdsWsServer = SrcdsWsApiServer.getInstace();

srcdsWsServer.onMessage('player_connected', async (srcds, data) => {
  srcds
    .request('get_players_request')
    .then((players) => {
      onlinePlayersGauge.set(
        {
          server: srcds.getInfo().name ?? 'unknown',
        },
        players.length,
      );
    })
    .catch(() => {});

  const { token, steamId, ip, port } = data;

  const profile = await getPlayerProfile(steamId);

  db.client.connected(
    token,
    steamId,
    srcds.getInfo().id,
    ip,
    port,
    profile?.name || null,
  );

  try {
    const rankUpdateData = toSrcdsRankData(await getRankData(steamId));
    rankUpdateData.show = false;

    if (rankUpdateData.rank) {
      srcds.send('rank_update', [rankUpdateData]);
    }
  } catch (e) {
    dbgErr(e);
  }
});

srcdsWsServer.onMessage('player_disconnected', async (srcds, data) => {
  srcds
    .request('get_players_request')
    .then((players) => {
      onlinePlayersGauge.set(
        {
          server: srcds.getInfo().name ?? 'unknown',
        },
        players.length,
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
  const { steamId, msg } = data;

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

srcdsWsServer.onMessage('set_settings', async (srcds, data) => {
  const { steamId, settings: s } = data;

  const settings: PlayerClientSettings = {
    fov: s.fov,
    magnumZoomFov: s.magnumZoomFov,
    crossbowZoomFov: s.crossbowZoomFov,
    drawViewmodel: s.drawviewmodel == null ? null : Boolean(s.drawviewmodel),
    esp: s.esp == null ? null : Boolean(s.esp),
    dsp: s.dsp == null ? null : Boolean(s.dsp),
    amb: s.amb == null ? null : Boolean(s.amb),
    bob: s.bob == null ? null : Boolean(s.bob),
    fg: s.fg == null ? null : Boolean(s.fg),
    hitSound: s.hitsound == null ? null : Boolean(s.hitsound),
    killSound: s.killsound == null ? null : Boolean(s.killsound),
    kevlarSound: s.kevlarsound == null ? null : Boolean(s.kevlarsound),
  };

  await db.client.settings.set(steamId, settings);
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
