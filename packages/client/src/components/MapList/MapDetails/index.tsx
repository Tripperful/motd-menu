import classNames from 'classnames';
import React, { FC, MouseEventHandler, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { motdApi } from 'src/api';
import { setMapDetails, useMapDetails } from 'src/hooks/state/mapDetails';
import { addNotification } from 'src/hooks/state/notifications';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useCvar } from 'src/hooks/useCvar';
import { SidePanel } from '~components/common/SidePanel';
import { Spinner } from '~components/common/Spinner';
import HeartEmptyIcon from '~icons/heart-outline.svg';
import HeartIcon from '~icons/heart.svg';
import PencilIcon from '~icons/pencil.svg';
import ArrowRightIcon from '~icons/thick-arrow-right.svg';
import { outlineButton, verticalScroll } from '~styles/elements';
import { theme } from '~styles/theme';
import { EditDescriptionPopup } from './EditDescriptionPopup';
import { MapImages } from './MapImages';
import { MapReactions } from './MapReactions';
import { MapReviews } from './MapReviews';
import { MapTags } from './MapTags';
import { OtherVersions } from './OtherVersions';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
  },
  content: {
    ...verticalScroll(),
    minHeight: 0,
    flex: '1 1 100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
  previewImage: {
    borderRadius: '1em',
    flex: '0 0 auto',
    height: '100%',
  },
  description: {
    flex: '0 0 auto',
    wordBreak: 'break-word',
  },
  emptyText: {
    color: theme.fg3,
  },
  actionsSection: {
    display: 'flex',
    gap: '1em',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    background: theme.bg1,
    padding: '0.5em',
  },
  editButton: {
    ...outlineButton(),
    fontSize: '0.75em',
    float: 'right',
    marginLeft: '0.5em',
  },
  favButton: {
    ...outlineButton(),
    fontSize: '0.75em',
  },
  actionButton: {
    ...outlineButton(),
  },
});

interface MapDetailsProps {
  mapName: string;
  backPath?: string;
}

const MapVersion: FC = () => {
  const { mapName } = useParams();
  return <MapDetails mapName={mapName} backPath="../.." />;
};

const MapDetailsContent: FC<MapDetailsProps> = ({ mapName }) => {
  const c = useStyles();
  const canEdit = useCheckPermission('maps_edit');

  const mapDetails = useMapDetails(mapName);

  if (!mapDetails) return null;

  const { description } = mapDetails;

  const onDescriptionSubmit = async (desc: string) => {
    try {
      const description = desc || null;

      await motdApi.setMapDescription(mapName, description);

      setMapDetails(mapName, {
        ...mapDetails,
        description,
      });
    } catch {
      addNotification('error', 'Failed to edit map description!');
    }
  };

  return (
    <>
      <MapImages mapName={mapName} />
      <div className={classNames(c.description, !description && c.emptyText)}>
        {canEdit && (
          <Link className={c.editButton} to="edit-description">
            <PencilIcon />
            Edit description
          </Link>
        )}
        {description || 'No description'}
      </div>
      <MapTags mapName={mapName} />
      <MapReactions mapName={mapName} />
      <OtherVersions mapName={mapName} />
      <MapReviews mapName={mapName} />
      <Routes>
        <Route
          path="/edit-description"
          element={
            <EditDescriptionPopup
              initialDescription={description}
              onSubmit={onDescriptionSubmit}
            />
          }
        />
        <Route
          path="/versions/:mapName/*"
          Component={MapVersion}
        />
      </Routes>
    </>
  );
};

const favContent = (
  <>
    <HeartIcon />
    Remove from favorites
  </>
);
const unfavContent = (
  <>
    <HeartEmptyIcon />
    Add to favorites
  </>
);

const FavButton: FC<MapDetailsProps> = ({ mapName }) => {
  const c = useStyles();

  const { isFavorite } = useMapDetails(mapName);

  const onClick: MouseEventHandler<HTMLDivElement> = async () => {
    const newFavorite = !isFavorite;
    try {
      await motdApi.setMapFavorite(mapName, newFavorite);

      setMapDetails(mapName, (c) => ({
        ...c,
        isFavorite: newFavorite,
      }));

      addNotification(
        'success',
        newFavorite ? 'Added map to favorites!' : 'Removed map from favorites!',
      );
    } catch {
      addNotification(
        'error',
        'Failed to ' + newFavorite
          ? 'add map to favorites!'
          : 'remove map from favorites!',
      );
    }
  };

  return (
    <div className={c.actionButton} onClick={onClick}>
      {isFavorite ? favContent : unfavContent}
    </div>
  );
};

export const MapDetails: FC<MapDetailsProps> = ({
  mapName,
  backPath = '..',
}) => {
  const c = useStyles();

  const onRunMapClick: MouseEventHandler<HTMLDivElement> = () => {
    motdApi.runMap(mapName);
    motdApi.closeMenu();
  };

  const [mmPublic] = useCvar('mm_public');
  const isPublic = mmPublic === '1';
  const canChangeMap = useCheckPermission('pub_change_maps') || !isPublic;

  return (
    <SidePanel
      backPath={backPath}
      title={<h2>{'Map details - ' + mapName}</h2>}
      noContentWrapper
    >
      <div className={c.root}>
        <div className={c.content}>
          <Suspense fallback={<Spinner />}>
            <MapDetailsContent mapName={mapName} />
          </Suspense>
        </div>
        <div className={c.actionsSection}>
          <Suspense>
            <FavButton mapName={mapName} />
          </Suspense>
          {canChangeMap && (
            <div className={c.actionButton} onClick={onRunMapClick}>
              Run map
              <ArrowRightIcon />
            </div>
          )}
        </div>
      </div>
    </SidePanel>
  );
};
