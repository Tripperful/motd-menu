import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import SpinnerIcon from '~icons/spinner.svg';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1em',
    width: '100%',
    height: '100%',
  },
  spinnerIcon: {
    width: '50%',
    height: '50%',
    maxWidth: '5em',
    maxHeight: '5em',
  },
});

export const Spinner: FC = () => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <SpinnerIcon className={c.spinnerIcon} />
    </div>
  );
};
