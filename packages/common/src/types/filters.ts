import { MatchStatus } from './match';

export interface MatchFilters {
  mapName?: string;
  players?: string[];
  serverName?: string;
  matchStatuses?: MatchStatus[];
}
