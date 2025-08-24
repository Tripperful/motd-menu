import { SteamPlayerData } from '@motd-menu/common';
import React, { FC, Suspense, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes } from 'react-router-dom';
import {
  getMatchResultsFilters,
  setMatchResultsFilters,
} from 'src/hooks/state/matchResults';
import { useGoBack } from 'src/hooks/useGoBack';
import { MatchResultPopup } from '~components/MatchMenu/MatchResultPopup';
import {
  MatchResultsContent,
  MatchResultsSkeleton,
} from '~components/MatchMenu/MatchResultsMenu';
import { Popup } from '~components/common/Popup';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  content: {
    gap: '0.5em',
  },
  chip: {
    fontSize: '0.8em',
    padding: '0.2em 0.5em',
    backgroundColor: theme.bg1,
    borderRadius: '0.5em',
    textShadow: '0 0 4px #000b',
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

export const PlayerMatchesPopup: FC<{ profile: SteamPlayerData }> = ({
  profile,
}) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [total, setTotal] = useState(null as number);
  const { steamId } = profile;

  return (
    <Popup
      title={
        <span className={c.header}>
          {`${profile.name}'s matches`}
          {total != null && <span className={c.chip}>{total}</span>}
        </span>
      }
      onClose={goBack}
      fullScreen
      contentClassName={c.content}
    >
      <PlayerMatchesContent steamId={steamId} setTotal={setTotal} />
      <Routes>
        <Route path="/:matchId/*" element={<MatchResultPopup />} />
      </Routes>
    </Popup>
  );
};
