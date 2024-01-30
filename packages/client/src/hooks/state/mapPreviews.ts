import { useMemo } from 'react';
import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const mapsPreviewsState = createGlobalState(() => motdApi.getMapsPreviews());

export const useMapsPreviews = () => mapsPreviewsState.useExternalState();

export const setMapsPreviews = mapsPreviewsState.set;

export const useMapPreview = (mapName: string) => {
  const previews = useMapsPreviews();

  return useMemo(
    () => previews.find((p) => p.name === mapName),
    [mapName, previews],
  );
};

export const getMapPrevew = async (mapName: string) =>
  (await mapsPreviewsState.get())?.find((p) => p.name === mapName);

export const useAllMapsTags = () => {
  const previews = useMapsPreviews();

  return useMemo(() => {
    const allTags = previews.reduce((res, preview) => {
      if (preview.tags?.length) {
        res.push(...preview.tags);
      }

      return res;
    }, [] as string[]);

    const tagsWithCount = [] as { tag: string; count: number }[];

    for (const tag of allTags) {
      let twc = tagsWithCount.find((t) => t.tag === tag);

      if (!twc) {
        twc = { tag, count: 0 };
        tagsWithCount.push(twc);
      }

      twc.count++;
    }

    return tagsWithCount
      ?.sort((t1, t2) => {
        const c = t2.count - t1.count;

        return c === 0 ? (t1.tag > t2.tag ? 1 : t1.tag < t2.tag ? -1 : 0) : c;
      })
      ?.map((t) => t.tag);
  }, [previews]);
};
