import classNames from 'classnames';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, LinkProps } from 'react-router-dom';
import { useNewsPreviews } from 'src/hooks/state/news';
import EnvelopeIcon from '~icons/envelope.svg';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    ...activeItem(),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '2.5em',
    height: '2.5em',
    borderRadius: '50%',
    backgroundColor: theme.bg1,
  },
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
    animation: '$blink 3s infinite',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 0.4em',
  },
  '@keyframes blink': {
    '0%': {
      opacity: 1,
    },
    '5%': {
      opacity: 0,
    },
    '10%': {
      opacity: 1,
    },
  },
});

const NewsBadgeDot: FC = () => {
  const c = useStyles();
  const { unread } = useNewsPreviews();

  return unread ? <div className={c.dot}>{unread}</div> : null;
};

export const NewsBadge: FC<LinkProps> = ({ to, className }) => {
  const c = useStyles();

  return (
    <Link className={classNames(c.root, className)} to={to}>
      <EnvelopeIcon />
      <Suspense>
        <NewsBadgeDot />
      </Suspense>
    </Link>
  );
};
