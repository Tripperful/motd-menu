import { PlayerClientSettings } from '@motd-menu/common';
import { dropAuthCache } from 'src/auth';
import { db } from 'src/db';
import { getPlayerProfile } from 'src/steam';
import { dbgErr } from 'src/util';
import { getEfpsRank, sendMatchToEfps } from 'src/util/efps';
import { SrcdsWsApiServer } from './SrcdsWsApiServer';
import { chargerUseHandler } from './chargerUseHandler';

const srcdsWsServer = SrcdsWsApiServer.getInstace();

srcdsWsServer.onMessage('player_connected', async (srcds, data) => {
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
    const rankData = await getEfpsRank(steamId);

    if (rankData?.rank) {
      srcds.send('rank_update', [{ ...rankData, show: false }]);
    }
  } catch (e) {
    dbgErr(e);
  }
});

srcdsWsServer.onMessage('player_disconnected', async (srcds, data) => {
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
  const { steamId } = data;
  const cmd = data.msg.toLowerCase();

  const permissions = await db.permissions.get(steamId);

  // Only for dev for now
  if (!permissions.includes('dev')) return;

  if (cmd === '!votespec') {
    const players = await srcds.request('get_players_request');
    const callee = players.find((p) => p.steamId === steamId);

    if (callee?.teamIdx === 1) return;

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
    hitSound: s.hitsound == null ? null : Boolean(s.hitsound),
    killSound: s.killsound == null ? null : Boolean(s.killsound),
    kevlarSound: s.kevlarsound == null ? null : Boolean(s.kevlarsound),
  };

  await db.client.settings.set(steamId, settings);
});

srcdsWsServer.onMessage('match_started', (srcds, data) =>
  db.matchStats.matchStarted(srcds.getInfo().id, data),
);

srcdsWsServer.onMessage('match_ended', async (srcds, data) => {
  await db.matchStats.matchEnded(data);

  if (process.env.MOTD_EFPS_KEY && data.status === 'completed') {
    const { isDev } = await db.server.getById(srcds.getInfo().id);

    if (!isDev) {
      await sendMatchToEfps(data.id);
    }

    const servers = SrcdsWsApiServer.getInstace().getConnectedClients();

    await Promise.allSettled(
      servers.map(async (connectedSrcds) => {
        const players = await connectedSrcds.request('get_players_request');

        const playersRanks = (
          await Promise.all(
            players.map((player) => getEfpsRank(player.steamId)),
          )
        ).filter(Boolean);

        await db.matchStats.updateAfterMatchRanks(data.id, playersRanks);
        connectedSrcds.send(
          'rank_update',
          playersRanks.map((rank) => ({ ...rank, show: true })),
        );
      }),
    );
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
