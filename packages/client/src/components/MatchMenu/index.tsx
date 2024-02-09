import { Cvar, StartMatchSettings, matchCvars } from '@motd-menu/common';
import React, {
  FC,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { resetOnlinePlayers } from 'src/hooks/state/players';
import { getStoredMatchCvar, storeMatchCvar } from 'src/storage/matchCvars';
import { Page } from '~components/common/Page';
import RefreshIcon from '~icons/refresh.svg';
import ArrowRightIcon from '~icons/thick-arrow-right.svg';
import { activeItem, outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { MatchPlayers } from './MatchPlayers';
import { MatchSettings } from './MatchSettings';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
  },
  footer: {
    flex: '0 0 auto',
    display: 'flex',
    gap: '1em',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    background: theme.bg1,
    padding: '0.5em',
  },
  refreshButton: {
    ...activeItem(),
    display: 'flex',
    marginRight: '0.5em',
  },
  actionButton: {
    ...outlineButton(),
  },
});

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

export const MatchMenu: FC = () => {
  const c = useStyles();

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
    <Page
      title="Match menu"
      headerContent={
        <div className={c.refreshButton} onClick={() => resetOnlinePlayers()}>
          <RefreshIcon />
        </div>
      }
    >
      <StartMatchSettingsContext.Provider value={ctx}>
        <div className={c.root}>
          <MatchPlayers />
          <div className={c.footer}>
            <Link to="settings" className={c.actionButton}>
              Match settings
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
        <Routes>
          <Route path="settings" element={<MatchSettings />} />
        </Routes>
      </StartMatchSettingsContext.Provider>
    </Page>
  );
};

export default MatchMenu;
