import { SteamPlayerData } from './steam';

export interface OnlinePlayerInfo {
  steamId: string;
  userId?: number;
  steamProfile?: SteamPlayerData;
}

export interface PlayerClientSettings {
  hitSound: boolean;
  killSound: boolean;
  fov: number;
  magnumZoomFov: number;
  crossbowZoomFov: number;
  esp: boolean;
  dsp: boolean;
  drawViewmodel: boolean;
}
