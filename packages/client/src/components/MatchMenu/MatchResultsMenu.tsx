import { MatchSummary, MatchSummaryTeam } from '@motd-menu/common';
import Color from 'color';
import range from 'lodash/range';
import React, { FC, Suspense, useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import {
  fetchMoreMatchResults,
  resetMatchResults,
  useMatchResults,
} from 'src/hooks/state/matchResults';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { teamInfoByIdx } from 'src/util/teams';
import { MapPreviewImage } from '~components/common/MapPreviewImage';
import { ActionPage } from '~components/common/Page/ActionPage';
import { PageFetcher } from '~components/common/PageFetcher';
import SearchIcon from '~icons/search.svg';
import ArrowRightIcon from '~icons/thick-arrow-right.svg';
import { activeItem, skeletonBg } from '~styles/elements';
import { theme } from '~styles/theme';
import { MatchResultPopup } from './MatchResultPopup';
import { MatchResultsFilters } from './MatchResultsFilters';

const useStyles = createUseStyles({
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    gap: '0.5em',
    overflow: 'hidden scroll',
    padding: '0.5em',
  },
  result: {
    display: 'flex',
    backgroundColor: theme.bg1,
    borderRadius: '0.5em',
    padding: '0.5em',
    gap: '1em',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.bg2,
    },
  },
  matchDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    alignItems: 'flex-start',
    flex: '1 1 auto',
  },
  spaceBetween: {
    alignSelf: 'stretch',
    display: 'flex',
    justifyContent: 'space-between',
  },
  chip: {
    fontSize: '0.8em',
    padding: '0.2em 0.5em',
    backgroundColor: theme.bg2,
    borderRadius: '0.5em',
    textShadow: '0 0 4px #000b',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  chipScore: {
    color: theme.fg2,
  },
  status: {
    fontSize: '0.8em',
    padding: '0.2em 0.5em',
    borderRadius: '0.5em',
  },
  mapImageWrapper: {
    minWidth: '10em',
    borderRadius: '0.5em',
    backgroundColor: theme.bg2,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  score: {
    fontSize: '1.2em',
    borderRadius: '0.5em',
    overflow: 'hidden',
    display: 'flex',
    gap: '0.1em',
    boxShadow: '0 0 8px #000',
    position: 'relative',
    margin: '1em',
  },
  scoreItem: {
    padding: '0.1em 0.3em',
    color: theme.fg2,
    textShadow: '0 0 4px #000b',
    position: 'relative',
  },
  playersChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5em',
    fontSize: '0.8em',
  },
  filtersButton: {
    ...activeItem(),
    display: 'flex',
  },
  '@keyframes bgShift': {
    from: {
      backgroundPositionX: '0vw',
    },
    to: {
      backgroundPositionX: '100vw',
    },
  },
  tileSkeleton: {
    ...skeletonBg(),
    animation: '$bgShift 1s linear infinite',
    height: '5.66em',
    flex: '0 0 auto',
    backgroundColor: theme.bg2,
    borderRadius: '0.5em',
  },
});

const matchType = (match: MatchSummary) => {
  if (match.teams.length === 1) {
    return match.teams[0].players.length === 2 ? '1v1' : 'FFA';
  } else {
    return match.teams.map((t) => t.players.length).join('v');
  }
};

const MatchScore: FC<{ data: MatchSummary }> = ({ data }) => {
  const c = useStyles();

  const scores =
    data.teams.length === 1
      ? data.teams[0].players.map((p) => ({
          score: p.kills,
          team: 0,
        }))
      : data.teams.map((t) => ({
          score: t.players.reduce((a, b) => a + b.kills, 0),
          team: t.index,
        }));

  scores.sort((a, b) => b.score - a.score);

  return (
    <div className={c.score}>
      {scores.map((s, i) => (
        <span
          key={i}
          className={c.scoreItem}
          style={{
            backgroundColor: Color(teamInfoByIdx(s.team).color)
              .alpha(0.8)
              .hexa(),
          }}
        >
          {s.score}
        </span>
      ))}
    </div>
  );
};

const PlayersChips: FC<{ teams: MatchSummaryTeam[] }> = ({ teams }) => {
  const c = useStyles();

  const players = useMemo(() => {
    const players = teams.flatMap((t) =>
      t.players.map((p) => ({ ...p, team: t.index })),
    );

    const teamsScoresByIndex = teams.reduce(
      (acc, t) => {
        acc[t.index] = t.players.reduce((a, b) => a + b.kills, 0);
        return acc;
      },
      {} as Record<number, number>,
    );

    players.sort((a, b) => {
      if (a.team !== b.team) {
        return teamsScoresByIndex[b.team] - teamsScoresByIndex[a.team];
      }

      return b.kills - a.kills;
    });

    return players;
  }, [teams]);

  return (
    <div className={c.playersChips}>
      {players.map((p) => (
        <span
          key={p.steamId}
          className={c.chip}
          style={{ color: teamInfoByIdx(p.team).color }}
        >
          <span>{p.profile.name}</span>
          <span className={c.chipScore}>
            {p.kills}:{p.deaths}
          </span>
        </span>
      ))}
    </div>
  );
};

const MatchStatusChip: FC<{ match: MatchSummary }> = ({ match }) => {
  const c = useStyles();

  return (
    <div
      className={c.chip}
      style={{
        color: match.status === 'completed' ? theme.fgSuccess : theme.fgError,
      }}
    >
      {match.status}{' '}
      {new Date(
        match.startDate + (match.duration ?? 0) * 1000,
      ).toLocaleString()}
    </div>
  );
};

const MatchResult: FC<{ data: MatchSummary }> = ({ data }) => {
  const c = useStyles();

  return (
    <Link to={data.id} key={data.id} className={c.result}>
      <div className={c.mapImageWrapper}>
        <MapPreviewImage className={c.mapImage} mapName={data.mapName} />
        <MatchScore data={data} />
      </div>
      <div className={c.matchDetails}>
        <div className={c.spaceBetween}>
          <span>
            <span className={c.chip}>{matchType(data)}</span> - {data.mapName}
          </span>
          <span className={c.chip}>{data.server}</span>
        </div>
        <MatchStatusChip match={data} />
        <PlayersChips teams={data.teams} />
      </div>
    </Link>
  );
};

export const MatchResultsContent: FC<{
  setTotal?: (total: number) => void;
}> = ({ setTotal }) => {
  const { results, hasMore, total } = useMatchResults();

  useEffect(() => {
    setTotal?.(total);
  }, [setTotal, total]);

  return (results?.length ?? 0) === 0 ? (
    'No matches found'
  ) : (
    <>
      {results.map((result) => (
        <MatchResult key={result.id} data={result} />
      ))}
      <PageFetcher hasMore={hasMore} loadMore={fetchMoreMatchResults} />
    </>
  );
};

export const MatchResultsSkeleton: FC = () => {
  const c = useStyles();

  return (
    <>
      {range(10).map((i) => (
        <div key={i} className={c.tileSkeleton}></div>
      ))}
    </>
  );
};

export const MatchResultsMenu: FC = () => {
  const c = useStyles();
  const [total, setTotal] = useState(null as number);

  const isMatchOrganizer = useCheckPermission('match_organizer') && false;

  return (
    <ActionPage
      title={
        <span className={c.pageHeader}>
          Match results
          {total != null && <span className={c.chip}>{total}</span>}
        </span>
      }
      refreshAction={resetMatchResults}
      headerContent={
        <Link to="filters" className={c.filtersButton}>
          <SearchIcon />
        </Link>
      }
      actions={
        isMatchOrganizer
          ? [
              {
                to: 'start',
                children: (
                  <>
                    Start a match
                    <ArrowRightIcon />
                  </>
                ),
              },
            ]
          : null
      }
    >
      <div className={c.content}>
        <Suspense fallback={<MatchResultsSkeleton />}>
          <MatchResultsContent setTotal={setTotal} />
        </Suspense>
        <Routes>
          <Route path="filters/*" element={<MatchResultsFilters />} />
          <Route path="/:matchId/*" element={<MatchResultPopup />} />
        </Routes>
      </div>
    </ActionPage>
  );
};
