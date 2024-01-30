import React, { FC, Suspense, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { motdApi } from 'src/api';
import { setMapDetails, useMapDetails } from 'src/hooks/state/mapDetails';
import {
  getMapPrevew,
  useAllMapsTags,
  useMapPreview,
} from 'src/hooks/state/mapPreviews';
import { addNotification } from 'src/hooks/state/notifications';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useConfirmDialog } from 'src/hooks/useConfirmDialog';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { Toggle } from '~components/common/Toggle';
import AddTagIcon from '~icons/add-tag.svg';
import DeleteIcon from '~icons/delete.svg';
import { activeItem, outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    color: theme.fg2,
    gap: '0.5em',
    flexWrap: 'wrap',
  },
  tag: {
    border: '0.2em solid currentColor',
    padding: '0 0.4em',
    borderRadius: '1em',
    display: 'flex',
    gap: '0.25em',
    alignItems: 'center',
    textWrap: 'nowrap',
  },
  noTags: {
    color: theme.fg3,
  },
  deleteBtn: {
    ...activeItem(),
    color: theme.fgError,
    fontSize: '0.5em',
  },
  tagsDialog: {
    width: '20em',
  },
  addBtn: {
    ...outlineButton(),
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75em',
  },
  allTags: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
    flexWrap: 'wrap',
  },
  submitButton: {
    ...outlineButton(),
  },
});

interface MapTagsProps {
  mapName: string;
}

const NewTagDialog: FC<MapTagsProps & { existingTags: string[] }> = ({
  mapName,
  existingTags,
}) => {
  const c = useStyles();

  const goBack = useGoBack();

  const [tag, setTag] = useState('');

  const onSubmit = async () => {
    try {
      const newTag = tag.trim();

      if (existingTags.some((t) => t.toLowerCase() === newTag.toLowerCase())) {
        addNotification('error', 'This tag already exists!');
        return;
      }

      const { tags: oldTags } = await getMapPrevew(mapName);
      const tags = [...oldTags, newTag];

      await motdApi.setMapTags(mapName, tags);

      setMapDetails(mapName, async (c) => ({
        ...(await c),
        tags,
      }));

      addNotification('success', 'Added new tag!');

      goBack();
    } catch {
      addNotification('error', 'Failed to add new tag!');

      goBack();
    }
  };

  return (
    <Popup title="Create new tag" onClose={goBack}>
      <small>New tag</small>
      <input
        type="text"
        autoFocus
        value={tag}
        onChange={(e) => setTag(e.currentTarget.value)}
      />
      <div className={c.submitButton} onClick={onSubmit}>
        Submit
      </div>
    </Popup>
  );
};

const AddTagDialog: FC<MapTagsProps> = ({ mapName }) => {
  const c = useStyles();

  const goBack = useGoBack();
  const path = useLocation().pathname;

  const curMapsTags = useAllMapsTags();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialTags = useMemo(() => curMapsTags, [path]);

  const allMapsTags = useMemo(
    () => Array.from(new Set([...initialTags, ...curMapsTags])).sort(),
    [curMapsTags, initialTags],
  );

  const mapTags = useMapPreview(mapName)?.tags;

  const setTagActive = async (tag: string, active: boolean) => {
    try {
      const { tags: oldTags } = await getMapPrevew(mapName);
      const tags = [...oldTags].filter((t) => t !== tag);

      if (active) {
        tags.push(tag);
      }

      await motdApi.setMapTags(mapName, tags);

      setMapDetails(mapName, async (c) => ({
        ...(await c),
        tags,
      }));

      addNotification('success', `Tag ${active ? 'added' : 'removed'}!`);
    } catch {
      addNotification('error', `Failed to ${active ? 'add' : 'remove'} tag!`);
    }
  };

  return (
    <Popup title="Add map tag" onClose={goBack} className={c.tagsDialog}>
      <small>Existing tags</small>
      <div className={c.allTags}>
        {allMapsTags?.map((tag) => (
          <Toggle
            className={c.tag}
            active={mapTags.includes(tag)}
            setActive={(active) => setTagActive(tag, active)}
            key={tag}
          >
            {tag}
          </Toggle>
        ))}
        <Link className={c.addBtn} to="new">
          <AddTagIcon />
          Add new tag
        </Link>
      </div>
      <Routes>
        <Route
          path="/new"
          element={
            <NewTagDialog mapName={mapName} existingTags={allMapsTags} />
          }
        />
      </Routes>
    </Popup>
  );
};

const MapTag: FC<{ mapName: string; tag: string; editable?: boolean }> = ({
  mapName,
  tag,
  editable,
}) => {
  const c = useStyles();

  const [deleteConfirmDialog, showDeleteDialog] = useConfirmDialog(
    'Remove this tag?',
    async () => {
      try {
        const { tags: oldTags } = await getMapPrevew(mapName);

        const tags = oldTags.filter((t) => t !== tag);

        motdApi.setMapTags(mapName, tags);

        setMapDetails(mapName, async (c) => ({
          ...(await c),
          tags,
        }));

        addNotification('success', 'Tag removed!');
      } catch {
        addNotification('error', 'Failed to remove tag!');
      }
    },
  );

  return (
    <div className={c.tag}>
      <span>{tag}</span>
      {editable && (
        <div className={c.deleteBtn} onClick={showDeleteDialog}>
          <DeleteIcon />
        </div>
      )}
      {deleteConfirmDialog}
    </div>
  );
};

const MapTagsContent: FC<MapTagsProps> = ({ mapName }) => {
  const c = useStyles();
  const tags = useMapDetails(mapName).tags;
  const editable = useCheckPermission('maps_edit');

  return (
    <>
      {tags?.length ? (
        <>
          Tags:
          {tags.map((t) => (
            <MapTag key={t} mapName={mapName} tag={t} editable={editable} />
          ))}
        </>
      ) : (
        <div className={c.noTags}>No tags</div>
      )}
      {editable && (
        <>
          <Link className={c.addBtn} to="add-tag">
            <AddTagIcon />
            Add tag
          </Link>
        </>
      )}
    </>
  );
};

export const MapTags: FC<MapTagsProps> = ({ mapName }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <Suspense>
        <MapTagsContent mapName={mapName} />
      </Suspense>
      <Routes>
        <Route path="/add-tag/*" element={<AddTagDialog mapName={mapName} />} />
      </Routes>
    </div>
  );
};
