import { Cvar, StartMatchSettings, matchCvars } from '@motd-menu/common';
import React, {
  FC,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Route, Routes } from 'react-router-dom';
import { resetOnlinePlayers } from 'src/hooks/state/players';
import { getStoredMatchCvar, storeMatchCvar } from 'src/storage/matchCvars';
import { ActionPage } from '~components/common/Page/ActionPage';
import ArrowRightIcon from '~icons/thick-arrow-right.svg';
import { MatchPlayers } from './MatchPlayers';
import { MatchSettings } from './MatchSettings';

type StartMatchCvars = StartMatchSettings['cvars'];
type MatchPlayers = StartMatchSettings['players'];

interface StartMatchSettingsContextData {
  cvars: StartMatchCvars;
  players: MatchPlayers;
  setCvarValue: (cvar: Cvar, value: string) => void;
  setPlayers: (players: MatchPlayers) => void;
}

export const StartMatchSettingsContext =
  createContext<StartMatchSettingsContextData>(null);

export const StartMatchMenu: FC = () => {
  const [cvars, setCvars] = useState<StartMatchCvars>(() =>
    Object.fromEntries(
      matchCvars.map((cvar) => [cvar, getStoredMatchCvar(cvar)]),
    ),
  );

  const setCvarValue = useCallback((cvar: Cvar, value: string) => {
    setCvars((cur) => ({
      ...cur,
      [cvar]: value,
    }));
    storeMatchCvar(cvar, value);
  }, []);

  const [players, setPlayers] = useState<MatchPlayers>({});

  const ctx = useMemo<StartMatchSettingsContextData>(
    () => ({
      cvars,
      players,
      setCvarValue,
      setPlayers,
    }),
    [cvars, players, setCvarValue, setPlayers],
  );

  return (
    <ActionPage
      title="Match results"
      refreshAction={resetOnlinePlayers}
      actions={[
        {
          to: 'settings',
          children: (
            <>
              Match settings
              <ArrowRightIcon />
            </>
          ),
        },
      ]}
    >
      <StartMatchSettingsContext.Provider value={ctx}>
        <MatchPlayers />
        <Routes>
          <Route path="settings" element={<MatchSettings />} />
        </Routes>
      </StartMatchSettingsContext.Provider>
    </ActionPage>
  );
};
