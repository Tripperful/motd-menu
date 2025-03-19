import { HslColor } from './color';
import type { SteamPlayerData } from './steam';

export interface OnlinePlayerInfo {
  steamId: string;
  userId?: number;
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

export interface HitSoundPathsData {
  head?: string;
  body?: string;
  kill?: string;
  hskill?: string;
  teamkill?: string;
}

export interface PlayerClientSettings {
  hitSound: boolean;
  killSound: boolean;
  kevlarSound: boolean;
  fov: number;
  magnumZoomFov: number;
  crossbowZoomFov: number;
  esp: boolean;
  dsp: boolean;
  amb: boolean;
  bob: boolean;
  drawViewmodel: boolean;
  hitSoundPaths?: HitSoundPathsData;
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
