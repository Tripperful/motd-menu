import React, { FC, InputHTMLAttributes } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
});

export const LabeledInput: FC<
  InputHTMLAttributes<HTMLInputElement> & { label: string }
> = ({ label, ...props }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <input {...props} />
      <div>{label}</div>
    </div>
  );
};
