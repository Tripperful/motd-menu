import React from 'react';
import { FC } from 'react';
import { createUseStyles } from 'react-jss';
import snowflakesVideoUrl from '~assets/snow.webm';

const useStyles = createUseStyles({
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
  },
});

export const SnowOverlay: FC = () => {
  const c = useStyles();

  const date = new Date();
  const m = date.getMonth();
  const d = date.getDate();

  // Only show in range Dec 20 - Jan 20
  if ((m === 0 && d <= 20) || (m === 11 && d >= 20)) {
    return (
      <video className={c.root} autoPlay muted loop>
        <source type="video/mp4" src={snowflakesVideoUrl} />
      </video>
    );
  } else {
    return null;
  }
};
