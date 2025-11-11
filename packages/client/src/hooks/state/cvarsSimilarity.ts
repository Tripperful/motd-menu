import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const playerSettingsMetadataState = createGlobalState((steamId: string) =>
  motdApi.getCvarSimilarity(steamId),
);

export const useCvarsSimilarity = playerSettingsMetadataState.useExternalState;
