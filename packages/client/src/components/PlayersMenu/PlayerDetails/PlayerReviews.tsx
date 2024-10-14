import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { usePlayerReviews } from 'src/hooks/state/playerReviews';
import { MapReview } from '~components/MapList/MapDetails/MapReview';

const useStyles = createUseStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden auto',
    paddingRight: '0.5em',
    gap: '1em',
  },
});

export const PlayerReviews: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const reviews = usePlayerReviews(steamId);

  if (reviews.length === 0) return null;

  return (
    <div className={c.list}>
      {reviews?.map((r) => (
        <MapReview key={r.mapName} review={r} mapDetailsMode />
      ))}
    </div>
  );
};
