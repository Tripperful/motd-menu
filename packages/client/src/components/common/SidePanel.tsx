import React, {
  FC,
  MouseEventHandler,
  ReactNode,
  Suspense,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import { fullscreen, verticalScroll } from '~styles/elements';
import { boxShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { ChildrenProps } from '~types/props';
import { PageHeader } from './PageHeader';
import { Spinner } from './Spinner';

const useStyles = createUseStyles({
  bg: {
    ...fullscreen(),
    backgroundColor: theme.backdrop,
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
    ...verticalScroll(),
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
});

export const SidePanel: FC<
  ChildrenProps & {
    title: ReactNode;
    backPath?: string;
    noContentWrapper?: boolean;
  }
> = ({ title, backPath = '..', children, noContentWrapper = false }) => {
  const c = useStyles();
  const [shown, setShown] = useState(false);
  const nav = useNavigate();

  useLayoutEffect(() => {
    setShown(true);
  }, []);

  const onBgClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) {
      nav(backPath, { relative: 'path' });
    }
  };

  return (
    shown &&
    createPortal(
      <div className={c.bg} onPointerDown={onBgClick}>
        <div className={c.root}>
          <PageHeader title={title} backPath={backPath} />
          {noContentWrapper ? (
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          ) : (
            <div className={c.content}>
              <Suspense fallback={<Spinner />}>{children}</Suspense>
            </div>
          )}
        </div>
      </div>,
      document.getElementById('modalRoot'),
    )
  );
};
