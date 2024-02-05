import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';

export const useStyles = createUseStyles({
  root: {
    ...activeItem(),
    padding: '0.5em',
    display: 'flex',
    backgroundColor: theme.bg1,
    borderRadius: '0.5em',
  },
  avatar: {
    display: 'inline-block',
    width: '3em',
    height: '3em',
    marginRight: '0.5em',
    borderRadius: '0.5em',
    float: 'left',
    backgroundColor: theme.bg1,
  },
  playerInfo: {
    flex: '1 1 100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  steamId: {
    fontSize: '0.8em',
  },
});

export const PlayersListItem: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const profile = usePlayerSteamProfile(steamId);

  return (
    <Link className={c.root} to={profile.steamId}>
      <img className={c.avatar} src={profile.avatar} />
      <div className={c.playerInfo}>
        <div>{profile.name}</div>
        <div className={c.steamId}>{profile.steamId}</div>
      </div>
    </Link>
  );
};
