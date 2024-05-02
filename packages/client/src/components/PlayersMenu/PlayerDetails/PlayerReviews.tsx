import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { usePlayerReviews } from 'src/hooks/state/playerReviews';
import { MapReview } from '~components/MapList/MapDetails/MapReview';

const useStyles = createUseStyles({
  root: {},
  list: {
    margin: '0.5em 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden auto',
    paddingRight: '0.5em',
    maxHeight: '50vh',
    gap: '1em',
  },
});

interface PlayerReviewsProps {
  steamId: string;
}

const PlayerReviewsContent: FC<PlayerReviewsProps> = ({ steamId }) => {
  const c = useStyles();
  const reviews = usePlayerReviews(steamId);

  if (reviews.length === 0) return null;

  return (
    <div className={c.root}>
      Maps reviews
      <div className={c.list}>
        {reviews?.map((r) => (
          <MapReview key={r.mapName} review={r} mapDetailsMode />
        ))}
      </div>
    </div>
  );
};

export const PlayerReviews: FC<PlayerReviewsProps> = ({ steamId }) => {
  return (
    <Suspense>
      <PlayerReviewsContent steamId={steamId} />
    </Suspense>
  );
};
