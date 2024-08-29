import { Cvar } from '../cvars';
import { SteamPlayerData } from './steam';

export type StartMatchPlayerTeams = { [steamId: string]: number };

export interface StartMatchSettings {
  cvars?: Partial<Record<Cvar, string>>;
  players?: StartMatchPlayerTeams;
}

export interface MatchSummaryTeamPlayer {
  steamId: string;
  kills: number;
  deaths: number;
  profile?: SteamPlayerData;
  points: number;
  rank: string;
  rankPos: number;
}

export interface MatchSummaryTeam {
  name: string;
  index: number;
  players: MatchSummaryTeamPlayer[];
}

export type MatchStatus =
  | 'interrupted'
  | 'votecancelled'
  | 'timeout'
  | 'started'
  | 'completed';

export interface MatchSummary {
  id: string;
  status: MatchStatus;
  server: string;
  mapName: string;
  demoName: string;
  demoLink?: string;
  initiator: string;
  duration: number;
  startDate: number;
  startCurtime: number;
  endCurtime: number;
  teams: MatchSummaryTeam[];
}

export interface MatchDeathData {
  curtime: number;
  attackerSteamId: string;
  victimSteamId: string;
  weapon: string;
  attackerScoreChange: number;
  victimScoreChange: number;
}

export interface MatchDamageData {
  steamId: string;
  damageDealtByWeapon: Record<string, number>;
}

export interface EfpsMatchSummaryKill {
  attacker: {
    steamId: string;
    team: number;
  };
  victim: {
    steamId: string;
    team: number;
  };
  weapon: string;
}

export interface EfpsMatchSummaryStat {
  steamId: string;
  fired: number;
  hit: number;
  hs: number;
  team: number;
}

export interface EfpsMatchSummary {
  id: string;
  server: string;
  map: string;
  teamplay: boolean;
  matchDuration: number;
  kills: EfpsMatchSummaryKill[];
  stats: EfpsMatchSummaryStat[];
}

export const matchCvarDefaults: Partial<Record<Cvar, string>> = {
  mp_timelimit: '15',
  mp_fraglimit: '0',
  mm_overtime: '60',
  mp_teamplay: '1',
  mm_equalizer: '1',
  mp_friendlyfire: '1',
  sv_alltalk: '0',
  mm_esp_teammates: '1',
  mp_flashlight: '1',
  mp_footsteps: '1',
  mm_hotbolt_fix: '1',
  mm_new_shotgun: '1',
  sv_hl2mp_item_respawn_time: '30',
  sv_hl2mp_weapon_respawn_time: '20',
  mm_rpg_spawn_time: '20',
  sv_gravity: '600',
};

export const matchCvars = Object.keys(matchCvarDefaults) as Cvar[];
