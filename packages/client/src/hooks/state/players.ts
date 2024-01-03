import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchPlayers = () => motdApi.getPlayers();

export const { useExternalState: useOnlinePlayers, reset: resetOnlinePlayers } =
  createGlobalState(fetchPlayers);

const fetchPlayer = (steamId: string) => motdApi.getPlayer(steamId);

export const { useExternalState: usePlayerProfile } =
  createGlobalState(fetchPlayer);
