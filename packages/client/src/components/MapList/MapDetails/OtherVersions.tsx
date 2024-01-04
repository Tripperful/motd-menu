import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { useMapDetails } from 'src/hooks/state/mapDetails';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import PencilIcon from '~icons/pencil.svg';
import ArrowRightIcon from '~icons/thick-arrow-right.svg';
import { activeItem, outlineButton } from '~styles/elements';
import { MapVersionsPopup } from './MapVersionsPopup';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: '1.5em',
    flex: '0 0 auto',
  },
  editButton: {
    ...outlineButton(),
    fontSize: '0.75em',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  header: {
    marginBottom: '0.25em',
  },
  version: {
    ...activeItem(),
    display: 'flex',
    gap: '0.5em',
    '& > svg': {
      fontSize: '0.65em',
    },
  },
});

const EditButton: FC = () => {
  const c = useStyles();
  const editable = useCheckPermission('maps_edit');

  return editable ? (
    <Link className={c.editButton} to="edit-versions">
      <PencilIcon />
      Edit versions
    </Link>
  ) : null;
};

const OtherVersionsContent: FC<{ mapName: string }> = ({ mapName }) => {
  const c = useStyles();
  const { otherVersions } = useMapDetails(mapName);

  if (otherVersions.length === 0) return null;

  return (
    <div className={c.root}>
      <div className={c.header}>Other versions</div>
      {otherVersions.map((name) => (
        <Link key={name} to={'versions/' + name} className={c.version}>
          <ArrowRightIcon />
          {name}
        </Link>
      ))}
    </div>
  );
};

export const OtherVersions: FC<{ mapName: string }> = ({ mapName }) => {
  const c = useStyles();

  const editButton = <EditButton />;
  const content = <OtherVersionsContent mapName={mapName} />;

  return (
    <>
      {editButton || content ? (
        <div className={c.root}>
          {content}
          {editButton}
        </div>
      ) : null}
      <Routes>
        <Route
          path="/edit-versions"
          element={<MapVersionsPopup mapName={mapName} />}
        />
      </Routes>
    </>
  );
};
