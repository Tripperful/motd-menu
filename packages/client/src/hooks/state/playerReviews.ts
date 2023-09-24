import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const playerReviewsState = createGlobalState((steamId: string) =>
  motdApi.getPlayerReviews(steamId),
);

export const usePlayerReviews = (steamId: string) =>
  playerReviewsState.useExternalState(steamId);
