import React, { FC, MouseEventHandler, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';
import { fullscreen } from '~styles/elements';
import { boxShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { ChildrenProps } from '~types/props';
import { PageHeader } from './PageHeader';

const useStyles = createUseStyles({
  bg: {
    ...fullscreen(),
    backgroundColor: theme.bg2,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  root: {
    ...boxShadow(5),
    width: '80vw',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.bg1,
  },
  content: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
});

export const SidePanel: FC<
  ChildrenProps & { title: string; onClose: () => void }
> = ({ title, onClose, children }) => {
  const c = useStyles();
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    setShown(true);
  }, []);

  const onBgClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    shown &&
    createPortal(
      <div className={c.bg} onPointerDown={onBgClick}>
        <div className={c.root}>
          <PageHeader title={title} />
          <div className={c.content}>{children}</div>
        </div>
      </div>,
      document.getElementById('modalRoot'),
    )
  );
};
