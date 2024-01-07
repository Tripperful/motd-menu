import { MapReviewData } from '@motd-menu/common';
import React, { FC, Suspense, useCallback, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { motdApi } from 'src/api';
import { setMapReviews, useMapReviews } from 'src/hooks/state/mapReviews';
import { addNotification } from 'src/hooks/state/notifications';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { Rating } from '~components/common/Rating';
import StarIcon from '~icons/star.svg';
import { outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { MapReview } from './MapReview';
import { RateMapPopup } from './RateMapPopup';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    flex: '1 1 100%',
  },
  rateHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  avgRate: {
    display: 'inline-flex',
  },
  emptyText: {
    color: theme.fg3,
  },
  rateButton: {
    ...outlineButton(),
    fontSize: '0.75em',
    marginLeft: 'auto',
  },
  comments: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    overflow: 'hidden auto',
    flex: '1 1 100%',
  },
});

interface MapReviewsProps {
  mapName: string;
}

const MapReviewsContent: FC<MapReviewsProps> = ({ mapName }) => {
  const c = useStyles();
  const reviews = useMapReviews(mapName);

  const onReviewSubmit = useCallback(
    async (review: MapReviewData, isNew: boolean) => {
      try {
        const newReview = await motdApi.postMapReview(mapName, review);

        setMapReviews(mapName, async (cur) => [
          newReview,
          ...(await cur).filter((r) => r.steamId !== newReview.steamId),
        ]);

        addNotification('success', `Review ${isNew ? 'posted' : 'updated'}!`);
      } catch {
        addNotification(
          'error',
          `Failed to ${isNew ? 'post' : 'update'} the review!`,
        );
      }
    },
    [mapName],
  );

  const steamId = useMySteamId();

  const myReview = useMemo(
    () => reviews && reviews.find((r) => r.steamId === steamId),
    [reviews, steamId],
  );

  const avgRate = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;

    const ratingsSum = reviews.reduce((sum, rating) => sum + rating.rate, 0);
    return ratingsSum / reviews.length;
  }, [reviews]);

  const reviewsCount = reviews?.length ?? 0;

  return (
    <div className={c.root}>
      <div className={c.rateHeader}>
        {avgRate ? (
          <>
            <Rating rate={avgRate} className={c.avgRate} />
            &nbsp;&nbsp;&nbsp;{avgRate.toFixed(2)} - based on {reviewsCount}{' '}
            review
            {reviewsCount % 10 == 1 ? '' : 's'}
          </>
        ) : reviews == null ? (
          <div className={c.emptyText}>Loading reviews...</div>
        ) : (
          <div className={c.emptyText}>No reviews yet</div>
        )}
        <Link className={c.rateButton} to="rate">
          <StarIcon />
          {myReview ? 'Update your review' : 'Rate map'}
        </Link>
      </div>
      {reviews?.length ? (
        <div className={c.comments}>
          {reviews?.map((review, idx) => (
            <MapReview key={idx} review={review} />
          ))}
        </div>
      ) : null}
      <Routes>
        <Route
          path="/rate"
          element={
            <RateMapPopup
              mapName={mapName}
              onSubmit={onReviewSubmit}
              initialReview={myReview}
            />
          }
        />
      </Routes>
    </div>
  );
};

const MapReviewsSkeleton: FC = () => {
  return <div>Loading...</div>;
};

export const MapReviews: FC<MapReviewsProps> = ({ mapName }) => {
  return (
    <Suspense fallback={<MapReviewsSkeleton />}>
      <MapReviewsContent mapName={mapName} />
    </Suspense>
  );
};
