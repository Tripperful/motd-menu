import React, { FC, Suspense, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import { useAllMapsTags } from 'src/hooks/state/mapPreviews';
import { Toggle } from '~components/common/Toggle';
import FavoritesIcon from '~icons/heart-outline.svg';
import FavoritesActiveIcon from '~icons/heart.svg';
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
    gap: '0.5em',
    padding: '0.5em 1em',
    overflow: 'scroll hidden',
    display: 'flex',
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
  },
});

const TagToggle: FC<{ tag: string }> = ({ tag }) => {
  const c = useStyles();
  const { tags, setTags } = useContext(FiltersContext);

  const active = tags.includes(tag);
  const setActive = (active: boolean) => {
    const newTags = tags.filter((t) => t !== tag);

    if (active) {
      newTags.push(tag);
    }

    setTags(newTags);
  };

  return (
    <Toggle active={active} setActive={setActive}>
      <span className={c.tag}>{tag}</span>
    </Toggle>
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
