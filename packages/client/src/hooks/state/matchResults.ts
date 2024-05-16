import { MatchFilters } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const matchResultsFiltersState = createGlobalState({
  matchStatuses: ['completed'],
} as MatchFilters);

export const resetMatchResultsFilters = () => matchResultsFiltersState.reset();

export const setMatchResultsFilters = (filters: MatchFilters) =>
  matchResultsFiltersState.set(filters);

export const useMatchResultsFilters = () =>
  matchResultsFiltersState.useExternalState();

export const getMatchResultsFilters = () => matchResultsFiltersState.get();

const matchResultsState = createGlobalState(async () =>
  motdApi.getMatchResults(0, await getMatchResultsFilters()),
);

export const resetMatchResults = () => matchResultsState.reset();

matchResultsFiltersState.subscribe(() => {
  resetMatchResults();
});

let fetching = false;
export const fetchMorematchResults = async () => {
  if (fetching) return;
  fetching = true;

  try {
    const cur = await matchResultsState.get();
    if (cur.data.length >= cur.total) return;

    const newResults = await motdApi.getMatchResults(
      cur.data.length,
      await getMatchResultsFilters(),
    );

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
    total,
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
