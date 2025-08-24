import range from 'lodash/range';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { useOnlinePlayers } from 'src/hooks/state/players';
import { skeletonBg, verticalScroll } from '~styles/elements';
import { PlayersListItem } from './PlayersListItem';

const useStyles = createUseStyles({
  '@keyframes bgShift': {
    from: {
      backgroundPositionX: '0vw',
    },
    to: {
      backgroundPositionX: '100vw',
    },
  },
  root: {
    ...verticalScroll(),
    display: 'grid',
    position: 'relative',
    gridTemplateColumns: 'repeat(auto-fill, minmax(15em, 1fr))',
    alignContent: 'start',
    gap: '0.5em',
    flex: '1 1 auto',
  },
  skeleton: {
    ...skeletonBg(),
    display: 'flex',
    padding: '0.5em',
    borderRadius: '0.5em',
    animation: '$bgShift 1s linear infinite',
    '&::before, &::after': {
      ...skeletonBg(),
      animation: '$bgShift 1s linear infinite',
      content: "''",
    },
    '&::before': {
      flex: '0 0 3em',
      height: '3em',
      marginRight: '0.5em',
      borderRadius: '0.5em',
    },
    '&::after': {
      flex: '1 1 100%',
      height: '1em',
    },
  },
});

export const PlayerListSkeleton: FC = () => {
  const c = useStyles();

  return (
    <>
      {range(10).map((i) => (
        <div key={i} className={c.skeleton} />
      ))}
    </>
  );
};

const PlayersListItems: FC = () => {
  const players = useOnlinePlayers();

  return (
    <>
      {(players?.length ?? 0) ? (
        players.map((data) => (
          <PlayersListItem
            key={data.steamId}
            steamId={data.steamId}
            aka={data.aka}
            ping={data.ping}
          />
        ))
      ) : (
        <div>No players online</div>
      )}
    </>
  );
};

export const PlayersList: FC = () => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <Suspense fallback={<PlayerListSkeleton />}>
        <PlayersListItems />
      </Suspense>
    </div>
  );
};
