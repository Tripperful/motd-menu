import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchPlayerStats = (steamId: string) => motdApi.getPlayerStats(steamId);

const playerStatsState = createGlobalState(fetchPlayerStats);

export const usePlayerStats = (steamId: string) =>
  playerStatsState.useExternalState(steamId);

export const setPlayerStats = (
  steamId: string,
  stats: Parameters<typeof playerStatsState.set>['0'],
) => playerStatsState.set(stats, steamId);
