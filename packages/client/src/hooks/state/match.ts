import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const matchState = createGlobalState(() => motdApi.getMatchState());

export const useMatchState = () => {
  return matchState.useExternalState();
};

export const resetMatchState = () => {
  matchState.reset();
};
