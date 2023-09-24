import classNames from 'classnames';
import { JssStyle } from 'jss';
import React, { FC, useCallback, useState } from 'react';
import { createUseStyles } from 'react-jss';
import ArrowLeft from '~icons/chevron-left.svg';
import ArrowRight from '~icons/chevron-right.svg';
import { activeItem } from '~styles/elements';
import { ClassNameProps } from '~types/props';

const fullSize: JssStyle = {
  width: '100%',
  height: '100%',
};

const useStyles = createUseStyles({
  root: {
    position: 'relative',
    overflow: 'hidden',
    '& > *': {
      position: 'absolute',
    },
  },
  imageBg: {
    ...fullSize,
    objectFit: 'cover',
    filter: 'blur(10px)',
  },
  image: {
    ...fullSize,
    objectFit: 'contain',
  },
  info: {
    fontSize: '0.75em',
    left: '0.5em',
    top: '0.5em',
  },
  changeBtns: {
    ...fullSize,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeBtn: {
    ...activeItem(),
  },
});

export const ImageCarousel: FC<
  {
    images: string[];
    startIdx?: number;
  } & ClassNameProps
> = ({ images, startIdx, className }) => {
  const c = useStyles();
  const imgCount = images.length;
  const [showIdx, setShowIdx] = useState(startIdx ?? 0);
  const isSingle = imgCount === 1;

  const info = `${showIdx + 1}/${imgCount}`;

  const setPrev = useCallback(() => {
    setShowIdx((c) => (c > 0 ? c - 1 : imgCount - 1));
  }, [imgCount]);

  const setNext = useCallback(() => {
    setShowIdx((c) => (c + 1) % imgCount);
  }, [imgCount]);

  const src = images[showIdx];

  return (
    <div className={classNames(c.root, className)}>
      <img className={c.imageBg} src={src} />
      <img className={c.image} src={src} />
      {!isSingle && (
        <>
          <div className={c.info}>{info}</div>
          <div className={c.changeBtns}>
            <div className={c.changeBtn} onClick={setPrev}>
              <ArrowLeft />
            </div>
            <div className={c.changeBtn} onClick={setNext}>
              <ArrowRight />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
