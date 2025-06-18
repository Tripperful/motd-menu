import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const playerSettingsMetadataState = createGlobalState(() =>
  motdApi.getPlayerSettingsMetadata(),
);

export const usePlayerSettingsMetadata = () =>
  playerSettingsMetadataState.useExternalState();

const playerSettingsValuesState = createGlobalState((steamId: string) =>
  motdApi.getPlayerSettingsValues(steamId),
);

export const usePlayerSettingsValues = (steamId: string) =>
  playerSettingsValuesState.useExternalState(steamId);

export const setPlayerSettingsValues = (
  steamId: string,
  settings: Parameters<typeof playerSettingsValuesState.set>[0],
) => playerSettingsValuesState.set(settings, steamId);
