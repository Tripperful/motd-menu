import { MapPreviewData } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { MapPreviewImage } from '~components/common/MapPreviewImage';
import { Rating } from '~components/common/Rating';
import FavoriteIcon from '~icons/heart.svg';
import { activeItem } from '~styles/elements';
import { filterShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { Tags } from './Tags';

const useStyles = createUseStyles({
  root: {
    ...activeItem(),
    backgroundColor: theme.bg1,
    borderRadius: '1em',
    height: '10em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  title: {
    color: theme.fg2,
    textShadow: '0 0 0.3em black',
    padding: '0.5em',
    maxWidth: '100%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    ...filterShadow(1),
  },
  name: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tags: {
    zIndex: 1,
    flex: '1 1 auto',
    padding: '0.5em',
    alignItems: 'center',
    alignContent: 'flex-end',
    color: theme.fg2,
    fontSize: '0.65em',
    display: 'flex',
    gap: '0.5em',
    flexWrap: 'wrap',
    ...filterShadow(3),
  },
  rating: {
    marginTop: '-1em',
    fontSize: '0.5em',
    padding: '0.5em',
    ...filterShadow(3),
  },
  fav: {
    flex: '0 0 auto',
    color: theme.fg1,
    fontSize: '0.75em',
  },
});

export const MapTile: FC<{ preview: MapPreviewData }> = ({
  preview: { name, rate, isFavorite, tags },
}) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <MapPreviewImage mapName={name} className={c.image} />
      <div className={c.title}>
        <div className={c.name}>{name}</div>
      </div>
      <Rating rate={rate} className={c.rating} />
      <div className={c.tags}>
        {isFavorite && <FavoriteIcon className={c.fav} />}
        <Tags tags={tags} />
      </div>
    </div>
  );
};
