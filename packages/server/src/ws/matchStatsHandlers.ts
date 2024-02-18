import {
  AmmoPickupMessage,
  BaseStatsMessage,
  BatteryPickupMessage,
  ItemPickupMessage,
  ItemRespawnMessage,
  MatchEndedMessage,
  MatchStartedMessage,
  MedkitPickupMessage,
  PlayerAttackMessage,
  PlayerDamageMessage,
  PlayerDeathMessage,
  PlayerRespawnMessage,
  WeaponDropMessage,
  WsMessageType,
  WsSubscriberCallback,
} from '@motd-menu/common';
import { db } from 'src/db';
import { dbgInfo } from 'src/util';

const handlerMap: Partial<
  Record<
    WsMessageType,
    (data: BaseStatsMessage, serverId: number) => Promise<void>
  >
> = {
  match_started: async (data: MatchStartedMessage, serverId) =>
    db.matchStats.matchStarted(serverId, data),

  match_ended: async (data: MatchEndedMessage) =>
    db.matchStats.matchEnded(data),

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
