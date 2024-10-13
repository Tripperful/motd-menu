import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const matchAccuracyState = createGlobalState(async (matchId: string) =>
  motdApi.getMatchAccuracy(matchId),
);

export const useMatchAccuracy = (matchId: string) => {
  return matchAccuracyState.useExternalState(matchId);
};
