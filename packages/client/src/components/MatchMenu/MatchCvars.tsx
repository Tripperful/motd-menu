import React from 'react';
import { FC } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: {},
});

export const MatchCvars: FC = () => {
  const c = useStyles();

  return <div className={c.root}>Cvars</div>;
};
