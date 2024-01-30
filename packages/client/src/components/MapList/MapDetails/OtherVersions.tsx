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

  return (
    <Link className={c.editButton} to="edit-versions">
      <PencilIcon />
      Edit versions
    </Link>
  );
};

const OtherVersionsContent: FC<{ versions: string[] }> = ({ versions }) => {
  const c = useStyles();

  if (versions?.length === 0) return null;

  return (
    <div className={c.root}>
      <div className={c.header}>Other versions</div>
      {versions.map((name) => (
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
  const editable = useCheckPermission('maps_edit');
  const { otherVersions } = useMapDetails(mapName);

  if (!(editable || otherVersions?.length)) return null;

  return (
    <>
      <div className={c.root} data-test>
        {editable && <EditButton />}
        {<OtherVersionsContent versions={otherVersions} />}
      </div>
      <Routes>
        <Route
          path="/edit-versions"
          element={<MapVersionsPopup mapName={mapName} />}
        />
      </Routes>
    </>
  );
};
