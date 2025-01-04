import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, LinkProps } from 'react-router-dom';
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
});

export const MenuBadge: FC<LinkProps> = ({ to, className, children }) => {
  const c = useStyles();

  return (
    <Link className={classNames(c.root, className)} to={to}>
      {children}
    </Link>
  );
};
