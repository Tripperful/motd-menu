import React from 'react';
import { FC } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: {},
});

export const Slider: FC<{
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
}> = () => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <input type="range" />
    </div>
  );
};
