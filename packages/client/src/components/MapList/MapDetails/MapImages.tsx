import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { motdApi } from 'src/api';
import { setMapDetails, useMapDetails } from 'src/hooks/state/mapDetails';
import { addNotification } from 'src/hooks/state/notifications';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { ImageCarousel } from '~components/common/ImageCarousel';
import PencilIcon from '~icons/pencil.svg';
import { outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { EditImagesPopup } from './EditImagesPopup';
import { Spinner } from '~components/common/Spinner';

const useStyles = createUseStyles({
  root: {
    position: 'relative',
    minHeight: '1.5em',
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
  },
  editButton: {
    ...outlineButton(),
    fontSize: '0.75em',
    alignSelf: 'flex-end',
    marginTop: '1em',
  },
  emptyText: {
    color: theme.fg3,
  },
  carousel: {
    height: '15em',
  },
});

const MapImagesContent: FC<{ mapName: string }> = ({ mapName }) => {
  const c = useStyles();
  const { images } = useMapDetails(mapName);

  const onImagesSubmit = async (images: string[]) => {
    try {
      await motdApi.setMapImages(mapName, images);

      setMapDetails(mapName, (cur) => ({
        ...cur,
        images,
      }));
    } catch {
      addNotification('error', 'Failed to edit map images!');
    }
  };

  return (
    <>
      {images?.length ? (
        <ImageCarousel images={images} className={c.carousel} />
      ) : (
        <div className={c.emptyText}>No images</div>
      )}
      <Routes>
        <Route
          path="/edit-images/*"
          element={
            <EditImagesPopup initialImages={images} onSubmit={onImagesSubmit} />
          }
        />
      </Routes>
    </>
  );
};

export const MapImages: FC<{ mapName: string }> = ({ mapName }) => {
  const c = useStyles();
  const canEdit = useCheckPermission('maps_edit');

  return (
    <div className={c.root}>
      <Suspense fallback={<Spinner />}>
        <MapImagesContent mapName={mapName} />
      </Suspense>
      {canEdit && (
        <Link className={c.editButton} to="edit-images">
          <PencilIcon />
          Edit images
        </Link>
      )}
    </div>
  );
};
