import {
  AmmoPickupMessage,
  BaseStatsMessage,
  BatteryPickupMessage,
  ChargerUseMessage,
  EntityTeleportMessage,
  ItemPickupMessage,
  ItemRespawnMessage,
  MatchEndedMessage,
  MatchStartedMessage,
  MedkitPickupMessage,
  PlayerAttackMessage,
  PlayerDamageMessage,
  PlayerDeathMessage,
  PlayerRespawnMessage,
  ProjectileBounceMessage,
  ProjectileDeathMessage,
  ProjectileLifetimeResetMessage,
  ProjectileOwnerChangeMessage,
  ProjectileSpawnMessage,
  WeaponDropMessage,
  WsMessageType,
  WsSubscriberCallback,
} from '@motd-menu/common';
import { db } from 'src/db';
import { dbgErr, dbgInfo } from 'src/util';
import { chargerUseHandler } from './chargerUseHandler';

const handlerMap: Partial<
  Record<
    WsMessageType,
    (data: BaseStatsMessage, serverId: number) => Promise<void>
  >
> = {
  match_started: async (data: MatchStartedMessage, serverId) =>
    db.matchStats.matchStarted(serverId, data),

  match_ended: async (data: MatchEndedMessage, serverId) => {
    await db.matchStats.matchEnded(data);

    if (process.env.MOTD_EFPS_STATS_POST_URL && data.status === 'completed') {
      try {
        const server = await db.server.getById(serverId);

        if (server.name.toLowerCase().includes('dev')) return;

        const efpsStats = await db.matches.getEfpsStats(data.id);

        await fetch(process.env.MOTD_EFPS_STATS_POST_URL, {
          method: 'POST',
          body: JSON.stringify(efpsStats),
        });
      } catch {
        dbgErr('Failed to post EFPS stats');
      }
    }
  },

  player_death: async (data: PlayerDeathMessage) =>
    db.matchStats.playerDeath(data),

  player_respawn: async (data: PlayerRespawnMessage) =>
    db.matchStats.playerRespawn(data),

  player_damage: async (data: PlayerDamageMessage) =>
    db.matchStats.playerDamage(data),

  item_respawn: async (data: ItemRespawnMessage) =>
    db.matchStats.itemRespawn(data),

  item_pickup: async (data: ItemPickupMessage) =>
    db.matchStats.itemPickup(data),

  player_attack: async (data: PlayerAttackMessage) =>
    db.matchStats.playerAttack(data),

  ammo_pickup: async (data: AmmoPickupMessage) =>
    db.matchStats.ammoPickup(data),

  weapon_drop: async (data: WeaponDropMessage) =>
    db.matchStats.weaponDrop(data),

  medkit_pickup: async (data: MedkitPickupMessage) =>
    db.matchStats.medkitPickup(data),

  battery_pickup: async (data: BatteryPickupMessage) =>
    db.matchStats.batteryPickup(data),

  charger_use: async (data: ChargerUseMessage) => chargerUseHandler(data),

  projectile_spawn: async (data: ProjectileSpawnMessage) =>
    db.matchStats.projectileSpawn(data),

  projectile_death: async (data: ProjectileDeathMessage) =>
    db.matchStats.projectileDeath(data),

  projectile_bounce: async (data: ProjectileBounceMessage) =>
    db.matchStats.projectileBounce(data),

  projectile_owner_change: async (data: ProjectileOwnerChangeMessage) =>
    db.matchStats.projectileOwnerChange(data),

  projectile_lifetime_reset: async (data: ProjectileLifetimeResetMessage) =>
    db.matchStats.projectileLifetimeReset(data),

  ent_teleport: async (data: EntityTeleportMessage) =>
    db.matchStats.entityTeleport(data),
};

type StatsCallback = WsSubscriberCallback<BaseStatsMessage>;

export const matchStatsHandlers = Object.fromEntries<StatsCallback>(
  Object.entries(handlerMap).map(
    ([msgType, handler]) =>
      [
        msgType,
        async (msg, serverId) => {
          if (!msg.data.id) {
            return dbgInfo('Stray match stats event: ' + JSON.stringify(msg));
          }

          await handler(msg.data, serverId);
        },
      ] as const,
  ),
) as Partial<Record<WsMessageType, StatsCallback>>;
