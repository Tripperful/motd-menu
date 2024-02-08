import React, { ComponentProps, FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Switch } from './Switch';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
});

export const LabeledSwitch: FC<
  ComponentProps<typeof Switch> & { label: string }
> = ({ label, ...props }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <Switch {...props} />
      <div>{label}</div>
    </div>
  );
};
