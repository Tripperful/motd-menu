import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const miscPlayerMatchStatsState = createGlobalState(
  async (matchAndSteamId: string) => {
    const [matchId, steamId] = matchAndSteamId.split(':');
    return motdApi.getMiscPlayerMatchStats(matchId, steamId);
  },
);

export const useMiscPlayerMatchStats = (matchId: string, steamId: string) => {
  return miscPlayerMatchStatsState.useExternalState(`${matchId}:${steamId}`);
};
