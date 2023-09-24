import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { usePlayerReviews } from 'src/hooks/state/playerReviews';
import { MapReview } from '~components/MapList/MapDetails/MapReview';

const useStyles = createUseStyles({
  root: {},
  list: {
    padding: '0.5em 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
});

interface PlayerReviewsProps {
  steamId: string;
}

const PlayerReviewsContent: FC<PlayerReviewsProps> = ({ steamId }) => {
  const c = useStyles();
  const reviews = usePlayerReviews(steamId);

  return (
    <div className={c.list}>
      {reviews.map((r) => (
        <MapReview key={r.mapName} review={r} mapDetailsMode />
      ))}
    </div>
  );
};

export const PlayerReviews: FC<PlayerReviewsProps> = ({ steamId }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      Maps reviews
      <Suspense>
        <PlayerReviewsContent steamId={steamId} />
      </Suspense>
    </div>
  );
};
