import { useMemo } from 'react';
import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const fetchPlayers = () => motdApi.getPlayers();

export const { useExternalState: usePlayers, reset: resetPlayers } =
  createGlobalState(fetchPlayers);

export const usePlayer = (steamId: string) => {
  const players = usePlayers();

  return useMemo(
    () => players.find((p) => p.steamId === steamId),
    [players, steamId],
  );
};
