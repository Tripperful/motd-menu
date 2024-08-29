import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchPlayerStats = (steamId: string) => motdApi.getPlayerStats(steamId);

const playerStatsState = createGlobalState(fetchPlayerStats);

export const usePlayerStats = (steamId: string) =>
  playerStatsState.useExternalState(steamId);
