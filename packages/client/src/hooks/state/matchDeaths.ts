import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const matchDeathsState = createGlobalState(async (matchId: string) =>
  motdApi.getMatchDeaths(matchId),
);

export const useMatchDeaths = (matchId: string) => {
  return matchDeathsState.useExternalState(matchId);
};
