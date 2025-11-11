import { HslColor } from './color';
import type { SteamPlayerData } from './steam';

export interface OnlinePlayerInfo {
  steamId: string;
  userId?: number;
  ping?: number;
  aka?: string;
  teamIdx?: number;
  kills?: number;
  deaths?: number;
  health?: number;
  armor?: number;
  stamina?: number;
  flashlight?: boolean;
  weapon?: string;
  steamProfile?: SteamPlayerData;
}

export interface ChatCommandInfo {
  name: string;
  help: string;
  matchmakingOnly: boolean;
  shortcuts: string[];
}
export interface EfpsRankData {
  title: string;
  points: number;
  pos: number;
  max: number;
}

export interface CustomRankData {
  title: string;
  colorStops: HslColor[];
}

export interface RankData {
  steamId: string;
  efpsRank?: EfpsRankData;
  customRank?: CustomRankData;
  show?: boolean;
  customRankExpiresOn?: number;
}

export interface PlayerServerStats {
  serverId: number;
  serverName: string;
  numConnections: number;
  avgPing: number;
}

export type BalancedTeamsData = { steamId: string; elo: number }[][];

interface CvarUnmatchedInfo {
  cvar: string;
  ref_values: string[];
  target_values: string[];
}
export interface CvarSimilarityData {
  steam_id: string;
  total_cvars: number;
  matching_cvars: number;
  match_percentage: number;
  unmatched_info: CvarUnmatchedInfo[];
}
