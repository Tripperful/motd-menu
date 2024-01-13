import { SteamPlayerData } from './steam';

export interface OnlinePlayerInfo {
  steamId: string;
  name: string;
  userId: number;
  steamProfile?: SteamPlayerData;
}
