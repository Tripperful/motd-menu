import { CountryCode } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: {
    height: '1em',
  },
});

export const Flag: FC<{ code: CountryCode }> = ({ code }) => {
  const c = useStyles();
  return (
    <img
      className={c.root}
      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
    />
  );
};
