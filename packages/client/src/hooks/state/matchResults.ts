import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const matchResultsState = createGlobalState(() => motdApi.getMatchResults(0));

export const resetMatchResults = () => {
  matchResultsState.reset();
};

let fetching = false;
export const fetchMorematchResults = async () => {
  if (fetching) return;
  fetching = true;

  try {
    const cur = await matchResultsState.get();
    if (cur.data.length >= cur.total) return;

    const newResults = await motdApi.getMatchResults(cur.data.length);

    matchResultsState.set({
      data: cur.data.concat(newResults.data),
      total: newResults.total,
    });
  } finally {
    fetching = false;
  }
};

export const useMatchResults = () => {
  const state = matchResultsState.useExternalState();
  const results = state?.data ?? [];
  const total = state?.total ?? 0;

  return {
    results,
    hasMore: results.length < total,
  };
};

const matchResultState = createGlobalState(
  async (matchId: string) =>
    (await matchResultsState.get())?.data?.find((m) => m.id === matchId) ??
    motdApi.getMatchResult(matchId),
);

export const useMatchResult = (matchId: string) => {
  return matchResultState.useExternalState(matchId);
};
