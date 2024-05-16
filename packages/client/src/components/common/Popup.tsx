import classNames from 'classnames';
import React, { FC, MouseEventHandler, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';
import CloseIcon from '~icons/close.svg';
import { activeItem, fullscreen } from '~styles/elements';
import { boxShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';

export const usePopupStyles = createUseStyles({
  bg: {
    ...fullscreen(),
    backgroundColor: theme.backdrop,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  root: {
    ...boxShadow(3),
    backgroundColor: theme.bg1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    padding: '1em',
    borderRadius: '1em',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    margin: '-0.5em -0.5em 0 0',
  },
  title: {
    marginRight: '1em',
  },
  closeButton: {
    ...activeItem(),
    marginLeft: 'auto',
    display: 'flex',
  },
});

export const Popup: FC<
  {
    children?: React.ReactNode;
    title: React.ReactNode;
    onClose: () => void;
  } & ClassNameProps
> = ({ children, title, onClose, className }) => {
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    setShown(true);
  }, []);

  const c = usePopupStyles();

  const onBgClick: MouseEventHandler = (e) => {
    if (e.target !== e.currentTarget) return;

    onClose();
  };

  return (
    shown &&
    createPortal(
      <div className={c.bg} onPointerDown={onBgClick}>
        <div className={classNames(c.root, className)}>
          <div className={c.header}>
            <div className={c.title}>{title}</div>
            <div className={c.closeButton} onClick={() => onClose()}>
              <CloseIcon />
            </div>
          </div>
          {children}
        </div>
      </div>,
      document.getElementById('modalRoot'),
    )
  );
};
