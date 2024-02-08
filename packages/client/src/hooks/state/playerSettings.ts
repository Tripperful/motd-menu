import { PlayerClientSettings } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchPlayerSettings = (steamId: string) =>
  motdApi.getPlayerSettings(steamId);

export const playerSettingsState = createGlobalState(fetchPlayerSettings);

export const usePlayerSettings = (steamId: string) =>
  playerSettingsState.useExternalState(steamId);

export const setPlayerSettings = (
  steamId: string,
  settings: PlayerClientSettings,
) => playerSettingsState.set(settings, steamId);
