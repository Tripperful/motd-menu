import { CountryCode } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import steamFlag from '~assets/images/flags/steam.svg?url';
import unknownFlag from '~assets/images/flags/unknown.svg?url';

const useStyles = createUseStyles({
  root: {
    height: '1em',
  },
});

const specialFlags: Partial<Record<CountryCode, string>> = {
  P2P: steamFlag,
  XX: unknownFlag,
};

export const Flag: FC<{ code: CountryCode }> = ({ code }) => {
  const c = useStyles();
  return (
    <img
      className={c.root}
      src={
        specialFlags[code] ??
        `https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`
      }
    />
  );
};
