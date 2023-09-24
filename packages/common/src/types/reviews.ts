import { SteamPlayerData } from './steam';

export interface MapReviewData {
  steamId?: string;
  mapName?: string;
  rate: number;
  comment?: string;
  author?: SteamPlayerData;
  timestamp?: number;
}
