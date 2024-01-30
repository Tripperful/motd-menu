import React, { FC, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';
import { useNotifications } from 'src/hooks/state/notifications';
import { fullscreen } from '~styles/elements';
import { Notification } from './Notification';

const useStyles = createUseStyles({
  root: {
    ...fullscreen(),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
});

const NotificationsList: FC = () => {
  const notifications = useNotifications();

  return <>{notifications?.map((n) => <Notification key={n.id} data={n} />)}</>;
};

export const Notifications: FC = () => {
  const c = useStyles();

  return createPortal(
    <div className={c.root}>
      <Suspense>
        <NotificationsList />
      </Suspense>
    </div>,
    document.getElementById('overlayRoot'),
  );
};
