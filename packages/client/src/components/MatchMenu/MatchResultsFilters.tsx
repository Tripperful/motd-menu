import { MatchStatus } from '@motd-menu/common';
import React, { FC, Suspense, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import {
  resetMatchResultsFilters,
  setMatchResultsFilters,
  useMatchResultsFilters,
} from 'src/hooks/state/matchResults';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { FindPlayerByNamePopup } from '~components/common/FindPlayerByNamePopup';
import { SidePanel } from '~components/common/SidePanel';
import { Spinner } from '~components/common/Spinner';
import { Switch } from '~components/common/Switch';
import CrossIcon from '~icons/close.svg';
import ClearFiltersIcon from '~icons/filter-clear.svg';
import AddPlayerIcon from '~icons/person-add.svg';
import SearchIcon from '~icons/search.svg';
import { activeItem, outlineButton, verticalScroll } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
  },
  content: {
    ...verticalScroll(),
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    flex: '1 1 auto',
    minHeight: 0,
  },
  sectionTitle: {
    marginBottom: '-0.5em',
  },
  actionsSection: {
    flex: '0 0 auto',
    display: 'flex',
    gap: '1em',
    justifyContent: 'space-between',
    marginTop: 'auto',
    background: theme.bg1,
    padding: '0.5em',
  },
  actionButton: {
    ...outlineButton(),
  },
  players: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5em',
  },
  player: {
    padding: '0.2em 0.5em',
    backgroundColor: theme.bg2,
    borderRadius: '0.5em',
    textShadow: '0 0 4px #000b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4em',
  },
  addBtn: {
    ...activeItem(),
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  removeBtn: {
    ...activeItem(),
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.65em',
  },
  statusFilters: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  statusFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
});

const PlayerChipContent: FC<{ steamId: string }> = ({ steamId }) => {
  const profile = usePlayerSteamProfile(steamId);

  return <>{profile.name}</>;
};

const PlayerChip: FC<{
  steamId: string;
  onRemove: (steamId: string) => void;
}> = ({ steamId, onRemove }) => {
  const c = useStyles();

  return (
    <div className={c.player}>
      <Suspense fallback="Loading...">
        <PlayerChipContent steamId={steamId} />
      </Suspense>
      <div className={c.removeBtn} onClick={() => onRemove(steamId)}>
        <CrossIcon />
      </div>
    </div>
  );
};

const matchStatusTitle: Record<MatchStatus, string> = {
  completed: 'Completed',
  votecancelled: 'Vote cancelled',
  interrupted: 'Interrupted',
  timeout: 'Timed out',
  started: 'Started',
};

const MatchStatusFilters: FC<{
  statuses: MatchStatus[];
  setStatuses: (statuses: MatchStatus[]) => void;
}> = ({ statuses, setStatuses }) => {
  const c = useStyles();

  return (
    <div className={c.statusFilters}>
      {Object.entries(matchStatusTitle).map(
        ([status, title]: [MatchStatus, string]) => (
          <div key={status} className={c.statusFilter}>
            <Switch
              active={statuses.includes(status)}
              setActive={(v) => {
                setStatuses(
                  v
                    ? [...statuses, status]
                    : statuses.filter((s) => s !== status),
                );
              }}
            />
            <span>{title}</span>
          </div>
        ),
      )}
    </div>
  );
};

const MatchResultsFiltersContent: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const currentFilters = useMatchResultsFilters();

  const [mapName, setMapName] = useState(currentFilters?.mapName ?? '');
  const [serverName, setServerName] = useState(
    currentFilters?.serverName ?? '',
  );
  const [players, setPlayers] = useState(currentFilters?.players ?? []);
  const [matchStatuses, setMatchStatuses] = useState(
    currentFilters?.matchStatuses ?? ['completed' as MatchStatus],
  );

  const onAddPlayer = (steamId: string) => {
    setPlayers((c) => [...c.filter((p) => p !== steamId), steamId]);
  };

  const onRemovePlayer = (steamId: string) => {
    setPlayers((c) => c.filter((p) => p !== steamId));
  };

  const onApplyFilters = () => {
    setMatchResultsFilters({ mapName, serverName, players, matchStatuses });
    goBack();
  };

  const onClearFilters = () => {
    resetMatchResultsFilters();
    goBack();
  };

  return (
    <>
      <div className={c.root}>
        <div className={c.content}>
          <div className={c.sectionTitle}>Map name (can be partial)</div>
          <input
            type="text"
            placeholder="Enter map name..."
            value={mapName}
            onChange={(e) => setMapName(e.currentTarget.value)}
          />
          <div className={c.sectionTitle}>Server name (can be partial)</div>
          <input
            type="text"
            placeholder="Enter server name..."
            value={serverName}
            onChange={(e) => setServerName(e.currentTarget.value)}
          />
          <div className={c.sectionTitle}>Players</div>
          <div className={c.players}>
            {players.map((player) => (
              <PlayerChip
                key={player}
                steamId={player}
                onRemove={onRemovePlayer}
              />
            ))}
            <Link className={c.addBtn} to="addPlayer">
              <AddPlayerIcon />
              {!players.length && 'Add player'}
            </Link>
          </div>
          <div className={c.sectionTitle}>Match statuses</div>
          <MatchStatusFilters
            statuses={matchStatuses}
            setStatuses={setMatchStatuses}
          />
        </div>
        <div className={c.actionsSection}>
          <div className={c.actionButton} onClick={onClearFilters}>
            <ClearFiltersIcon /> Reset filters
          </div>
          <div className={c.actionButton} onClick={onApplyFilters}>
            <SearchIcon /> Search
          </div>
        </div>
      </div>
      <Routes>
        <Route
          path="addPlayer/*"
          element={<FindPlayerByNamePopup onPlayerPicked={onAddPlayer} />}
        />
      </Routes>
    </>
  );
};

export const MatchResultsFilters: FC = () => (
  <SidePanel title={<h2>Match filters</h2>} noContentWrapper>
    <Suspense fallback={<Spinner />}>
      <MatchResultsFiltersContent />
    </Suspense>
  </SidePanel>
);
