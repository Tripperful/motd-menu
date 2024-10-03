import { WeaponType } from './weapons';

export type WsMessageType =
  | 'get_maps_request'
  | 'get_maps_response'
  | 'set_cvar'
  | 'run_command'
  | 'chat_print'
  | 'get_settings_request'
  | 'set_settings'
  | 'get_settings_response'
  | 'set_player_team'
  | 'get_cvars_response'
  | 'get_cvars_request'
  | 'get_smurfs_request'
  | 'get_smurfs_response'
  | 'player_connected'
  | 'player_chat'
  | 'client_exec'
  | 'rank_update'
  | 'changelevel'
  | 'get_players_request'
  | 'get_players_response'
  | 'get_names_request'
  | 'get_names_response'
  | 'player_disconnected'
  | 'start_match'
  | 'motd_auth_request'
  | 'motd_auth_response'
  | 'apply_settings'
  | 'client_cvars'
  | 'match_started'
  | 'match_ended'
  | 'player_death'
  | 'player_respawn'
  | 'player_damage'
  | 'item_respawn'
  | 'item_pickup'
  | 'player_attack'
  | 'ammo_pickup'
  | 'weapon_drop'
  | 'medkit_pickup'
  | 'battery_pickup'
  | 'charger_use'
  | 'projectile_spawn'
  | 'projectile_death'
  | 'projectile_bounce'
  | 'projectile_owner_change'
  | 'projectile_lifetime_reset'
  | 'ent_teleport'
  | 'motd_open'
  | 'motd_close';

export interface WsMessage<TData = unknown> {
  type: WsMessageType;
  guid?: string;
  data?: TData;
}

export type WsMessageCallback<TData = unknown> = (
  msg: WsMessage<TData>,
) => void;

export type WsSubscriberCallback<TData = unknown> = (
  msg: WsMessage<TData>,
  remoteId?: number,
  sessionId?: string,
) => Promise<WsMessage | void> | void;

export interface PlayerConnectedReqest {
  token: string;
  steamId: string;
  ip: string;
  port: number;
}

interface ConnectionStats {
  avgchoke: number;
  avglatency: number;
  avgloss: number;
  avgpackets: number;
  totaldata: number;
}

export interface PlayerDisconnectedReqest {
  token: string;
  connectionStats: {
    in: ConnectionStats;
    out: ConnectionStats;
  };
}

export interface SetSettingsAction {
  steamId: string;
  settings: {
    drawviewmodel: 0 | 1;
    esp: 0 | 1;
    dsp: 0 | 1;
    fov: number;
    magnumZoomFov: number;
    crossbowZoomFov: number;
    hitsound: 0 | 1;
    killsound: 0 | 1;
    kevlarsound: 0 | 1;
  };
}

export interface PlayerChatAction {
  steamId: string;
  teamIdx: number;
  msg: string;
}

export interface ClientCexecAction {
  steamId: string;
  command: string;
}

export interface BaseStatsMessage {
  curtime: number;
  tick: number;
  id: string;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BasePointMessage extends BaseStatsMessage {
  origin: Vec3;
}

export interface MatchEndedMessageTeam {
  index: number;
  name: string;
  players: MatchEndedMessageTeamPlayer[];
}

export interface MatchEndedMessageTeamPlayer {
  deaths?: number;
  kills?: number;
  steamId: string;
}

export interface MatchDataMessage extends BaseStatsMessage {
  id: string;
  demoId: string;
  initiator: string;
  mapName: string;
  teams: MatchEndedMessageTeam[];
}

export interface MatchStartedMessage extends MatchDataMessage {
  duration: number;
  status: string;
}

export interface MatchEndedMessage extends MatchDataMessage {
  duration: number;
  status: string;
}

export interface PlayerDeathMessage extends BasePointMessage {
  attacker: string;
  attackerOrigin?: Vec3;
  victim: string;
  weapon: WeaponType;
  model?: string;
  classname?: string;
  entityId?: string;
  distance: number;
}

export interface PlayerRespawnMessage extends BasePointMessage {
  angles: Vec3;
  steamId: string;
}

export interface PlayerDamageMessage extends BaseStatsMessage {
  attacker: string;
  attackerPos: Vec3;
  attackerAng: Vec3;
  victim: string;
  victimPos: Vec3;
  victimAng: Vec3;
  hpBefore: number;
  hpAfter: number;
  armorBefore: number;
  armorAfter: number;
  damage: number;
  damageOrigin: Vec3;
  weapon: string;
  classname: string;
  entityId: string;
  damageType: number;
  hitbox: Record<string, number>;
}

export interface PlayerAttackMessage extends BaseStatsMessage {
  wpn: string;
  entityId: string;
  steamId: string;
  pos: Vec3;
  ang: Vec3;
  attackType: number;
}

export interface ItemRespawnMessage extends BasePointMessage {
  item: string;
  entityId: string;
}

export interface WeaponDropMessage extends BasePointMessage {
  steamId: string;
  entityId: string;
  wpn: string;
}

export interface ItemPickupMessage extends BasePointMessage {
  item: string;
  entityId: string;
  steamId: string;
}

export interface MedkitPickupMessage extends BasePointMessage {
  steamId: string;
  entityId: string;
  hpBefore: number;
  hpAfter: number;
  big: number;
}

export interface ChargerUseMessage extends BasePointMessage {
  steamId: string;
  entityId: string;
  charger: string;
  hpBefore: number;
  hpAfter: number;
  armorBefore: number;
  armorAfter: number;
}

export interface BatteryPickupMessage extends BasePointMessage {
  steamId: string;
  entityId: string;
  armorBefore: number;
  armorAfter: number;
}

export interface AmmoPickupMessage extends BasePointMessage {
  steamId: string;
  ammoIndex: number;
  prev: number;
  post: number;
}

export interface ProjectileSpawnMessage extends BasePointMessage {
  projectile: string;
  entityId: string;
  steamId: string;
}

export interface ProjectileDeathMessage extends BasePointMessage {
  entityId: string;
  entityIdKiller: string;
  entityKiller: string;
  killerId: string;
  damage: number;
  damageType: number;
  ammoType: number;
  lifetime: number;
  distance: number;
}

export interface ProjectileBounceMessage extends BasePointMessage {
  entityId: string;
  distance: number;
}

export interface ProjectileOwnerChangeMessage extends BasePointMessage {
  entityId: string;
  prevOwner: string;
  newOwner: string;
}

export interface ProjectileLifetimeResetMessage extends BasePointMessage {
  entityId: string;
  timeleft: number;
  newlifetime: number;
}

export interface EntityTeleportMessage extends BaseStatsMessage {
  entityId: string;
  prevPos: Vec3;
  newPos: Vec3;
}

export interface RankUpdateData {
  steamId: string;
  points: number;
  rank: string;
  pos: number;
  max: number;
  r: number;
  g: number;
  b: number;
}

export interface MotdOpenAction {
  url: string;
  clients: string[];
}
