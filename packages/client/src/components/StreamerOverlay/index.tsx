import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { PlayerOverlayItem } from './PlayerOverlayItem';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
});

export const StreamerOverlay: FC<{
  name: string;
  avatarUrl: string;
  kills: number;
  deaths: number;
  hp: number;
  ap: number;
  sprint: number;
  flashlight: boolean;
  weapon: string;
}> = ({
  name,
  avatarUrl,
  kills,
  deaths,
  hp,
  ap,
  sprint,
  flashlight,
  weapon,
}) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <PlayerOverlayItem
        name={name}
        avatarUrl={avatarUrl}
        kills={kills}
        deaths={deaths}
        hp={hp}
        ap={ap}
        sprint={sprint}
        flashlight={flashlight}
        weapon={weapon}
      />
    </div>
  );
};
