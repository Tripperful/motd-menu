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
  esp: boolean;
  drawViewmodel: boolean;
}
