import classNames from 'classnames';
import React, { FC, MouseEventHandler, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';
import CloseIcon from '~icons/close.svg';
import { activeItem, fullscreen, verticalScroll } from '~styles/elements';
import { boxShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';
import { Spinner } from './Spinner';

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
    borderRadius: '1em',
    overflow: 'hidden',
    maxWidth: 'calc(100vw - 2em)',
    maxHeight: 'calc(100vh - 2em)',
  },
  poster: {
    width: `35em`,
  },
  fullHeight: {
    height: 'calc(100vh - 2em)',
  },
  fullScreen: {
    width: 'calc(100vw - 2em)',
    height: 'calc(100vh - 2em)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5em 0.5em 0.5em 1em',
    backgroundColor: theme.bg2,
  },
  content: {
    ...verticalScroll(),
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    flex: '1 1 auto',
  },
  closeButton: {
    ...activeItem(),
    padding: '0.5em',
    margin: '-0.5em -0.5em -0.5em auto',
    display: 'flex',
  },
});

export const Popup: FC<
  {
    children?: React.ReactNode;
    title: React.ReactNode;
    onClose: () => void;
    poster?: boolean;
    fullHeight?: boolean;
    fullScreen?: boolean;
    noContentWrapper?: boolean;
    contentClassName?: string;
  } & ClassNameProps
> = ({
  children,
  title,
  onClose,
  className,
  poster,
  fullHeight,
  fullScreen,
  noContentWrapper,
  contentClassName,
}) => {
  const c = usePopupStyles();

  const onBgClick: MouseEventHandler = (e) => {
    if (e.target !== e.currentTarget) return;

    onClose();
  };

  return createPortal(
    <div className={c.bg} onPointerDown={onBgClick}>
      <div
        className={classNames(
          c.root,
          className,
          poster && c.poster,
          fullScreen ? c.fullScreen : fullHeight ? c.fullHeight : null,
        )}
      >
        <div className={c.header}>
          <Suspense fallback="Loading...">{title}</Suspense>
          <div className={c.closeButton} onClick={() => onClose()}>
            <CloseIcon />
          </div>
        </div>
        <Suspense fallback={<Spinner />}>
          {noContentWrapper ? (
            children
          ) : (
            <div className={classNames(c.content, contentClassName)}>
              {children}
            </div>
          )}
        </Suspense>
      </div>
    </div>,
    document.getElementById('modalRoot'),
  );
};
