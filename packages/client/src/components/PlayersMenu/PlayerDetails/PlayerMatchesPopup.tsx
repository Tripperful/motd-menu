import React, { FC, Suspense, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes } from 'react-router-dom';
import {
  getMatchResultsFilters,
  setMatchResultsFilters,
} from 'src/hooks/state/matchResults';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { MatchResultPopup } from '~components/MatchMenu/MatchResultPopup';
import {
  MatchResultsContent,
  MatchResultsSkeleton,
} from '~components/MatchMenu/MatchResultsMenu';
import { Popup } from '~components/common/Popup';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    width: 'calc(100vw - 2em)',
    height: 'calc(100vh - 2em)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  chip: {
    fontSize: '0.8em',
    padding: '0.2em 0.5em',
    backgroundColor: theme.bg2,
    borderRadius: '0.5em',
    textShadow: '0 0 4px #000b',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    gap: '0.5em',
    overflow: 'hidden scroll',
    paddingRight: '0.5em',
  },
});

const useWithPlayerMatchesFilters = (steamId: string) => {
  const prevFiltersRef =
    useRef<ReturnType<typeof getMatchResultsFilters>>(null);

  if (!prevFiltersRef.current) {
    (async () => {
      prevFiltersRef.current = getMatchResultsFilters();

      setMatchResultsFilters({
        players: [steamId],
        matchStatuses: ['completed'],
      });
    })();
  }

  useEffect(() => {
    const prevFilters = prevFiltersRef.current;

    return () => {
      (async () => {
        setMatchResultsFilters(await prevFilters);
      })();
    };
  }, [steamId]);
};

const PlayerMatchesContent: FC<{
  steamId: string;
  setTotal?: (total: number) => void;
}> = ({ steamId, setTotal }) => {
  useWithPlayerMatchesFilters(steamId);

  return (
    <Suspense fallback={<MatchResultsSkeleton />}>
      <MatchResultsContent setTotal={setTotal} />
    </Suspense>
  );
};

const PlayerMatchesPopupTitle: FC<{ steamId: string; total: number }> = ({
  steamId,
  total,
}) => {
  const c = useStyles();
  const profile = usePlayerSteamProfile(steamId);

  return (
    <span className={c.header}>
      {`${profile.name}'s matches`}
      {total != null && <span className={c.chip}>{total}</span>}
    </span>
  );
};

export const PlayerMatchesPopup: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [total, setTotal] = useState(null as number);

  return (
    <Popup
      title={<PlayerMatchesPopupTitle steamId={steamId} total={total} />}
      onClose={goBack}
      className={c.root}
    >
      <div className={c.content}>
        <PlayerMatchesContent steamId={steamId} setTotal={setTotal} />
      </div>
      <Routes>
        <Route path="/:matchId/*" element={<MatchResultPopup />} />
      </Routes>
    </Popup>
  );
};
