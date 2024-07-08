import React, { FC, Suspense, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { setMapDetails } from 'src/hooks/state/mapDetails';
import { setMapsPreviews, useAllMapsTags } from 'src/hooks/state/mapPreviews';
import { addNotification } from 'src/hooks/state/notifications';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useConfirmDialog } from 'src/hooks/useConfirmDialog';
import { Toggle } from '~components/common/Toggle';
import DeleteIcon from '~icons/delete.svg';
import FavoritesIcon from '~icons/heart-outline.svg';
import FavoritesActiveIcon from '~icons/heart.svg';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';
import { FiltersContext } from './FiltersContext';
import { Sorting } from './Sorting';

const useStyles = createUseStyles({
  favs: {
    fontSize: '0.75em',
    display: 'flex',
  },
  tags: {
    fontSize: '0.75em',
    flex: '1 1 auto',
    height: '100%',
    gap: '0.5em',
    padding: '0 1em',
    overflow: 'scroll hidden',
    display: 'flex',
    alignItems: 'center',
    '-webkit-mask-image':
      'linear-gradient(90deg, transparent, white 1em, white calc(100% - 1em), transparent)',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    whiteSpace: 'nowrap',
  },
  tag: {
    border: '0.2em solid currentColor',
    padding: '0.2em 0.5em',
    borderRadius: '1em',
    textWrap: 'nowrap',
    display: 'flex',
    gap: '0.25em',
    alignItems: 'center',
  },
  tagDeleteBtn: {
    ...activeItem(),
    color: theme.fgError,
    fontSize: '0.5em',
    display: 'flex',
  },
});

const TagToggle: FC<{ tag: string }> = ({ tag }) => {
  const c = useStyles();
  const { tags, setTags } = useContext(FiltersContext);
  const canEditMaps = useCheckPermission('maps_edit');

  const active = tags.includes(tag);
  const setActive = (active: boolean) => {
    const newTags = tags.filter((t) => t !== tag);

    if (active) {
      newTags.push(tag);
    }

    setTags(newTags);
  };

  const [deleteConfirmDialog, showDeleteDialog] = useConfirmDialog(
    'Delete this tag from ALL maps?',
    async () => {
      try {
        await motdApi.deleteTag(tag);

        setActive(false);

        setMapsPreviews(async (previews) => {
          return (await previews).map((preview) => {
            if (preview.tags.includes(tag)) {
              setMapDetails(preview.name, async (d) => {
                const details = await d;

                return {
                  ...details,
                  tags: details.tags.filter((t) => t !== tag),
                };
              });

              return {
                ...preview,
                tags: preview.tags.filter((t) => t !== tag),
              };
            }

            return preview;
          });
        });

        addNotification('success', 'Tag deleted!');
      } catch {
        addNotification('error', 'Failed to delete tag!');
      }
    },
  );

  return (
    <>
      <Toggle active={active} setActive={setActive}>
        <span className={c.tag}>
          {tag}
          {canEditMaps && (
            <span
              className={c.tagDeleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                showDeleteDialog();
              }}
            >
              <DeleteIcon />
            </span>
          )}
        </span>
      </Toggle>
      {deleteConfirmDialog}
    </>
  );
};

const TagsContent: FC = () => {
  const c = useStyles();
  const tags = useAllMapsTags();

  return (
    <div
      className={c.tags}
      onWheel={(e) => {
        if (e.deltaX) return;

        e.currentTarget.scrollBy({
          left: e.deltaY,
        });
      }}
    >
      {tags?.map((t) => <TagToggle key={t} tag={t} />)}
    </div>
  );
};

export const Filters: FC = () => {
  const c = useStyles();
  const { favs, setFavs } = useContext(FiltersContext);

  return (
    <>
      <Suspense>
        <TagsContent />
      </Suspense>
      <Sorting />
      <Toggle active={favs} setActive={setFavs} className={c.favs}>
        {favs ? <FavoritesActiveIcon /> : <FavoritesIcon />}
      </Toggle>
    </>
  );
};
