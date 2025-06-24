import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { LinkProps } from 'react-router-dom';
import { useNewsPreviews } from 'src/hooks/state/news';
import { MenuBadge } from '~components/common/Menu/MenuBadge';
import EnvelopeIcon from '~icons/envelope.svg';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  dot: {
    position: 'absolute',
    top: '-0.5em',
    right: '-0.5em',
    minWidth: '1.5em',
    height: '1.5em',
    borderRadius: '10em',
    backgroundColor: theme.fgError,
    color: theme.fg1,
    fontSize: '0.75em',
    boxShadow: `0 0 0.25em ${theme.bgError}`,
    animation: '$blink 1s infinite',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 0.4em',
  },
  '@keyframes blink': {
    '0%': {
      transform: 'scale(1) rotate(0deg)',
    },
    '50%': {
      transform: 'scale(1.5) rotate(-15deg)',
    },
  },
});

const NewsBadgeDot: FC = () => {
  const c = useStyles();
  const { unread } = useNewsPreviews();

  return unread ? <div className={c.dot}>{unread}</div> : null;
};

export const NewsBadge: FC<LinkProps> = (props) => {
  return (
    <MenuBadge {...props} hint="News">
      <EnvelopeIcon />
      <Suspense>
        <NewsBadgeDot />
      </Suspense>
    </MenuBadge>
  );
};
