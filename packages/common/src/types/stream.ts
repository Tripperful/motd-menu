import { OnlinePlayerInfo } from './players';

export type StreamFrame = {
  timestamp: number;
  players: OnlinePlayerInfo[];
};
