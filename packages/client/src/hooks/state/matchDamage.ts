import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const matchDamageState = createGlobalState(async (matchId: string) =>
  motdApi.getMatchDamage(matchId),
);

export const useMatchDamage = (matchId: string) => {
  return matchDamageState.useExternalState(matchId);
};
