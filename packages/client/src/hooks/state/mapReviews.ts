import { MapReviewData } from '@motd-menu/common';
import { motdApi } from 'src/api';
import { setMapsPreviews } from './mapPreviews';
import { createGlobalState } from './util';

export const { useExternalState: useMapReviews, set: setMapReviewsRaw } =
  createGlobalState((mapName: string) => motdApi.getMapReviews(mapName));

const calcAvgRating = (reviews?: MapReviewData[]) =>
  reviews && reviews.length > 0
    ? reviews.reduce((sum, cur) => sum + cur.rate, 0) / reviews.length
    : 0;

export const setMapReviews = async (
  mapName: string,
  valueOrUpdater: Parameters<typeof setMapReviewsRaw>[0],
) => {
  const newReviews = await setMapReviewsRaw(valueOrUpdater, mapName);

  setMapsPreviews(
    async (cur) =>
      (await cur)?.map((preview) =>
        preview.name === mapName
          ? {
              ...preview,
              rate: calcAvgRating(newReviews),
            }
          : preview,
      ),
  );
};
