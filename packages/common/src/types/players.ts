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
