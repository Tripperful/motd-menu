import classNames from 'classnames';
import { JssStyle } from 'jss';
import React, { AnimationEventHandler, FC } from 'react';
import { createUseStyles } from 'react-jss';
import { deleteNotification } from 'src/hooks/state/notifications';
import { boxShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { NotificationData, NotificationType } from '~types/notifications';

const hidden: JssStyle = {
  marginTop: '0em',
  opacity: 0,
  maxHeight: '0em',
};

const hiddenUp: JssStyle = {
  ...hidden,
  transform: 'translateY(-10vh)',
};

const hiddenRight: JssStyle = {
  ...hidden,
  transform: 'translateX(100vw)',
};

const shown: JssStyle = {
  marginTop: '1em',
  opacity: 1,
  maxHeight: '5em',
  transform: 'translateY(0vh)',
};

const bounceAnimCurve = 'cubic-bezier(0.25, 0.1, 0.24, 1.15)';

const useStyles = createUseStyles({
  '@keyframes appear': {
    from: hiddenUp,
    to: shown,
  },
  root: {
    ...shown,
    animationTimingFunction: bounceAnimCurve,
    animation: '$appear 1s',
  },
  content: {
    ...boxShadow(3),
    padding: '1em',
    borderRadius: '1em',
    border: '0.2em solid currentColor',
  },
  info: {
    backgroundColor: theme.bgInfo,
  },
  error: {
    backgroundColor: theme.bgError,
  },
  success: {
    backgroundColor: theme.bgSuccess,
  },
  '@keyframes expired': {
    from: shown,
    to: hiddenRight,
  },
  expired: {
    animation: '$expired 1s',
  },
});

export const Notification: FC<{ data: NotificationData }> = ({ data }) => {
  const c = useStyles();

  const notifTypeClassMap: Record<NotificationType, string> = {
    info: c.info,
    error: c.error,
    success: c.success,
  };

  const onAnimEnd: AnimationEventHandler = (e) => {
    if (e.animationName.includes('expired')) {
      deleteNotification(data.id);
    }
  };

  return (
    <div
      className={classNames(c.root, data.expired && c.expired)}
      onAnimationEnd={onAnimEnd}
    >
      <div className={classNames(c.content, notifTypeClassMap[data.type])}>
        {data.text}
      </div>
    </div>
  );
};
