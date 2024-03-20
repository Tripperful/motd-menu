import { MatchSummary } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, Suspense, useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { useIntersection } from 'react-use';
import {
  fetchMorematchResults,
  resetMatchResults,
  useMatchResults,
} from 'src/hooks/state/matchResults';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { teamInfoByIdx } from 'src/util/teams';
import { MapPreviewImage } from '~components/common/MapPreviewImage';
import { ActionPage } from '~components/common/Page/ActionPage';
import ArrowRightIcon from '~icons/thick-arrow-right.svg';
import { theme } from '~styles/theme';
import { MatchResultPopup } from './MatchResultPopup';
import Color from 'color';

const useStyles = createUseStyles({
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
  uncompleted: {
    opacity: 0.5,
  },
  matchDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    alignItems: 'flex-start',
  },
  mapImageWrapper: {
    minWidth: '10em',
    height: '5em',
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
            backgroundColor: Color(teamInfoByIdx[s.team].color)
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

const MatchResult: FC<{ data: MatchSummary }> = ({ data }) => {
  const c = useStyles();

  return (
    <Link
      to={data.id}
      key={data.id}
      className={classNames(
        c.result,
        data.status !== 'completed' && c.uncompleted,
      )}
    >
      <div className={c.mapImageWrapper}>
        <MapPreviewImage className={c.mapImage} mapName={data.mapName} />
        <MatchScore data={data} />
      </div>
      <div className={c.matchDetails}>
        <div>
          {matchType(data)} - {data.mapName}
        </div>
        <div>Server: {data.server}</div>
        <div>
          {data.status}{' '}
          {new Date(
            data.startDate + (data.duration ?? 0) * 1000,
          ).toLocaleString()}
        </div>
      </div>
    </Link>
  );
};

const ResultsFetcher: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = (useIntersection(ref, {})?.intersectionRatio ?? 0) > 0;

  useEffect(() => {
    if (visible) {
      fetchMorematchResults();
    }
  }, [visible]);

  return <div ref={ref}>Loading more...</div>;
};

const MatchResultsContent: FC = () => {
  const { results, hasMore } = useMatchResults();

  return (
    <>
      {results.map((result) => (
        <MatchResult key={result.id} data={result} />
      ))}
      {hasMore && <ResultsFetcher />}
    </>
  );
};

export const MatchResultsMenu: FC = () => {
  const c = useStyles();

  const isMatchOrganizer = useCheckPermission('match_organizer');

  return (
    <ActionPage
      title="Match results"
      refreshAction={resetMatchResults}
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
        <Suspense>
          <MatchResultsContent />
          <Routes>
            <Route path="/:matchId/*" element={<MatchResultPopup />} />
          </Routes>
        </Suspense>
      </div>
    </ActionPage>
  );
};
