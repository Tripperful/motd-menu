import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchPlayerAka = (steamId: string) => motdApi.getPlayerAka(steamId);

const playerAkaState = createGlobalState(fetchPlayerAka);

export const usePlayerAka = (steamId: string) =>
  playerAkaState.useExternalState(steamId);

export const setPlayerAka = (steamId: string, aka: string) =>
  playerAkaState.set(aka, steamId);
