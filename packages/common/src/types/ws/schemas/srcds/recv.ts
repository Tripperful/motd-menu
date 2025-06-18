import { ClientSettingsValues } from '../../../clientSettings';
import type { WsApiSchema } from '../WsApiSchema';
import type {
  AmmoPickupData,
  BatteryPickupData,
  ChargerUseData,
  ClientCvarsData,
  EntityTeleportData,
  ItemPickupData,
  ItemRespawnData,
  MatchEndedData,
  MatchStartedData,
  MedkitPickupData,
  PlayerAttackData,
  PlayerChatData,
  PlayerConnectedData,
  PlayerDamageData,
  PlayerDeathData,
  PlayerDisconnectedData,
  PlayerRespawnData,
  PlayerSubstitutionData,
  ProjectileBounceData,
  ProjectileDeathData,
  ProjectileLifetimeResetData,
  ProjectileOwnerChangeData,
  ProjectileSpawnData,
  WeaponDropData,
} from './payloads';

export type SrcdsWsRecvSchema = WsApiSchema<{
  get_client_settings_request: {
    reqData: string;
    resType: 'get_client_settings_response';
    resData: ClientSettingsValues;
  };
  set_client_settings: {
    reqData: {
      steamId: string;
      settings: ClientSettingsValues;
    };
  };
  get_names_request: {
    reqData: string;
    resType: 'get_names_response';
    resData: string[];
  };
  get_smurfs_request: {
    reqData: string;
    resType: 'get_smurfs_response';
    resData: string[];
  };
  player_connected_request: {
    reqData: PlayerConnectedData;
    resType: 'player_connected_response';
    resData: { aka: string; geo: string };
  };
  player_disconnected: {
    reqData: PlayerDisconnectedData;
  };
  player_chat: {
    reqData: PlayerChatData;
  };
  player_respawn: {
    reqData: PlayerRespawnData;
  };
  player_attack: {
    reqData: PlayerAttackData;
  };
  player_damage: {
    reqData: PlayerDamageData;
  };
  player_death: {
    reqData: PlayerDeathData;
  };
  client_cvars: {
    reqData: ClientCvarsData;
  };
  match_started: {
    reqData: MatchStartedData;
  };
  match_ended: {
    reqData: MatchEndedData;
  };
  item_respawn: {
    reqData: ItemRespawnData;
  };
  item_pickup: {
    reqData: ItemPickupData;
  };
  ammo_pickup: {
    reqData: AmmoPickupData;
  };
  weapon_drop: {
    reqData: WeaponDropData;
  };
  medkit_pickup: {
    reqData: MedkitPickupData;
  };
  battery_pickup: {
    reqData: BatteryPickupData;
  };
  charger_use: {
    reqData: ChargerUseData;
  };
  projectile_spawn: {
    reqData: ProjectileSpawnData;
  };
  projectile_death: {
    reqData: ProjectileDeathData;
  };
  projectile_bounce: {
    reqData: ProjectileBounceData;
  };
  projectile_owner_change: {
    reqData: ProjectileOwnerChangeData;
  };
  projectile_lifetime_reset: {
    reqData: ProjectileLifetimeResetData;
  };
  ent_teleport: {
    reqData: EntityTeleportData;
  };
  player_substitution: {
    reqData: PlayerSubstitutionData;
  };
}>;
