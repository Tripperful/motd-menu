import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { PlayerOverlayItem } from './PlayerOverlayItem';
import { useGlobalStyles } from '~styles/global';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  team: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5em',
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
  useGlobalStyles();
  const c = useStyles();

  return (
    <div className={c.root}>
      <div className={c.team}>
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
          flip
        />
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
          flip
        />
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
          flip
        />
      </div>
      <div className={c.team}>
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
    </div>
  );
};
