import type { Cvar } from '../../../../cvars';
import type { HitSoundPathsData } from '../../../players';
import type { WeaponType } from '../../../weapons';

export interface PlayerConnectedData {
  token: string;
  steamId: string;
  ip: string;
  port: number;
}

export interface PlayerDisconnectedData {
  token: string;
  connectionStats: {
    in: ConnectionStats;
    out: ConnectionStats;
  };
}

export interface ClientSettingsData {
  fov: number;
  magnumZoomFov: number;
  crossbowZoomFov: number;
  drawviewmodel: 1 | 0;
  esp: 1 | 0;
  dsp: 1 | 0;
  amb: 1 | 0;
  bob: 1 | 0;
  fg: 1 | 0;
  hitsound: 1 | 0;
  killsound: 1 | 0;
  kevlarsound: 1 | 0;
  hitSoundPaths?: HitSoundPathsData;
}

export interface SetSettingsData {
  steamId: string;
  settings: ClientSettingsData;
}

interface ConnectionStats {
  avgchoke: number;
  avglatency: number;
  avgloss: number;
  avgpackets: number;
  totaldata: number;
}

export interface SetCvarData {
  cvar: Cvar;
  value: string;
}

export const enum MatchState {
  MatchChangelevel = 0,
  NotMatch,
  MatchCountdown,
  MatchInProgress,
  MatchInAutopause,
  MatchPaused,
  MatchPausedVoteInProgress,
  PostMatch,
}

export interface MatchStateData {
  state: MatchState;
  matchGuid?: string;
  participants?: string[];
}

export interface RunCommandData {
  commands: string;
}

export interface ChatPrintData {
  text: string;
  clients: string[];
}

export interface SetPlayerTeamData {
  userId: number;
  teamIndex: number;
}

export type SetCvarsResponseData = {
  [cvar in Cvar]: string;
};

export interface StartMatchData {
  token: string;
  preTimerCommands?: string;
  postTimerCommands?: string;
}

export interface ClientCvarsData {
  steamId: string;
  cvars: Record<string, string>;
}

export interface BaseStatsMessageData {
  curtime: number;
  tick: number;
  id: string;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BasePointMessageData extends BaseStatsMessageData {
  origin: Vec3;
}

export interface PlayerChatData {
  steamId: string;
  teamIdx: number;
  msg: string;
}

export interface ClientCexecData {
  steamId: string;
  command: string;
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
  show?: boolean;
}

export interface MotdOpenData {
  url: string;
  clients: string[];
}

export interface ChangeLevelData {
  token: string;
  mapName: string;
}

export interface BaseStatsData {
  curtime: number;
  tick: number;
  id: string;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BasePointStatsData extends BaseStatsData {
  origin: Vec3;
}

export interface MatchTeamData {
  index: number;
  name: string;
}

export interface MatchStartedTeamData extends MatchTeamData {
  players: string[];
}

export interface MatchEndedTeamPlayerData {
  deaths?: number;
  kills?: number;
  steamId: string;
}

export interface MatchEndedTeamData extends MatchTeamData {
  players: MatchEndedTeamPlayerData[];
}

export interface MatchData extends BaseStatsData {
  id: string;
  demoId: string;
  initiator: string;
  mapName: string;
}

export interface MatchStartedData extends MatchData {
  duration: number;
  status: string;
  teams: MatchStartedTeamData[];
}

export interface MatchEndedData extends MatchData {
  duration: number;
  status: string;
  teams: MatchEndedTeamData[];
}

export interface PlayerDeathData extends BasePointStatsData {
  attacker: string;
  attackerOrigin?: Vec3;
  victim: string;
  weapon: WeaponType;
  model?: string;
  classname?: string;
  entityId?: string;
  distance: number;
}

export interface PlayerRespawnData extends BasePointStatsData {
  angles: Vec3;
  steamId: string;
}

export interface PlayerDamageData extends BaseStatsData {
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

export interface PlayerAttackData extends BaseStatsData {
  wpn: string;
  entityId: string;
  steamId: string;
  pos: Vec3;
  ang: Vec3;
  attackType: number;
}

export interface ItemRespawnData extends BasePointStatsData {
  item: string;
  entityId: string;
}

export interface WeaponDropData extends BasePointStatsData {
  steamId: string;
  entityId: string;
  wpn: string;
}

export interface ItemPickupData extends BasePointStatsData {
  item: string;
  entityId: string;
  steamId: string;
}

export interface MedkitPickupData extends BasePointStatsData {
  steamId: string;
  entityId: string;
  hpBefore: number;
  hpAfter: number;
  big: number;
}

export interface ChargerUseData extends BasePointStatsData {
  steamId: string;
  entityId: string;
  charger: string;
  hpBefore: number;
  hpAfter: number;
  armorBefore: number;
  armorAfter: number;
}

export interface BatteryPickupData extends BasePointStatsData {
  steamId: string;
  entityId: string;
  armorBefore: number;
  armorAfter: number;
}

export interface AmmoPickupData extends BasePointStatsData {
  steamId: string;
  ammoIndex: number;
  prev: number;
  post: number;
}

export interface ProjectileSpawnData extends BasePointStatsData {
  projectile: string;
  entityId: string;
  steamId: string;
}

export interface ProjectileDeathData extends BasePointStatsData {
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

export interface ProjectileBounceData extends BasePointStatsData {
  entityId: string;
  distance: number;
}

export interface ProjectileOwnerChangeData extends BasePointStatsData {
  entityId: string;
  prevOwner: string;
  newOwner: string;
}

export interface ProjectileLifetimeResetData extends BasePointStatsData {
  entityId: string;
  timeleft: number;
  newlifetime: number;
}

export interface EntityTeleportData extends BaseStatsData {
  entityId: string;
  prevPos: Vec3;
  newPos: Vec3;
}

export interface PlayerSubstitutionData {
  oldPlayer: string;
  newPlayer: string;
}
