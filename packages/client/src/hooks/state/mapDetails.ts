import { motdApi } from 'src/api';
import { setMapsPreviews } from './mapPreviews';
import { createGlobalState } from './util';

const mapDetailsState = createGlobalState((mapName: string) =>
  motdApi.getMapDetails(mapName),
);

export const useMapDetails = mapDetailsState.useExternalState;

export const setMapDetails = async (
  mapName: string,
  details: Parameters<typeof mapDetailsState.set>[0],
) => {
  const newDetails = await mapDetailsState.set(details, mapName);

  setMapsPreviews(
    async (c) =>
      (await c)?.map((p) =>
        p.name === mapName
          ? {
              ...p,
              image: newDetails?.images?.[0] ?? null,
              tags: newDetails.tags,
              isFavorite: newDetails.isFavorite,
            }
          : p,
      ),
  );
};
