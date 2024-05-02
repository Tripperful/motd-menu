import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchOnlinePlayers = () => motdApi.getOnlinePlayers();

const onlinePlayersState = createGlobalState(fetchOnlinePlayers);

export const useOnlinePlayers = () => onlinePlayersState.useExternalState();

export const resetOnlinePlayers = () => onlinePlayersState.reset();

export const getOnlinePlayers = () => onlinePlayersState.get();

export const useIsPlayerOnline = (steamId: string) =>
  useOnlinePlayers()?.some((p) => p.steamId === steamId);

const fetchPlayerSteamProfile = async (steamId: string) =>
  (await onlinePlayersState.getRaw())?.find((p) => p.steamId === steamId)
    ?.steamProfile ?? (await motdApi.getPlayerSteamProfile(steamId));

export const playerSteamProfilesState = createGlobalState(
  fetchPlayerSteamProfile,
);

export const usePlayerSteamProfile = (steamId: string) =>
  playerSteamProfilesState.useExternalState(steamId);

const fetchPlayerNames = (steamId: string) => motdApi.getPlayerNames(steamId);

const playerNamesState = createGlobalState(fetchPlayerNames);

export const usePlayerNames = (steamId: string) =>
  playerNamesState.useExternalState(steamId);

const fetchPlayerSmurfSteamIds = (steamId: string) =>
  motdApi.getPlayerSmurfSteamIds(steamId);

const playerSmurfSteamIdsState = createGlobalState(fetchPlayerSmurfSteamIds);

export const usePlayerSmurfSteamIds = (steamId: string) =>
  playerSmurfSteamIdsState.useExternalState(steamId);
