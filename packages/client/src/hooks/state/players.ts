import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchOnlinePlayers = () => motdApi.getOnlinePlayers();

const onlinePlayersState = createGlobalState(fetchOnlinePlayers);

export const useOnlinePlayers = () => onlinePlayersState.useExternalState();

export const resetOnlinePlayers = () => onlinePlayersState.reset();

export const getOnlinePlayers = () => onlinePlayersState.get();

const fetchPlayerSteamProfile = async (steamId: string) =>
  (await onlinePlayersState.getRaw())?.find((p) => p.steamId === steamId)
    ?.steamProfile ?? (await motdApi.getPlayerSteamProfile(steamId));

const playerSteamProfilesState = createGlobalState(fetchPlayerSteamProfile);

export const usePlayerSteamProfile = (steamId: string) =>
  playerSteamProfilesState.useExternalState(steamId);
