import { SteamPlayerData } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
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

export const PlayersListItem: FC<{ data: SteamPlayerData }> = ({ data }) => {
  const c = useStyles();

  return (
    <Link className={c.root} to={data.steamId}>
      <img className={c.avatar} src={data.avatar} />
      <div className={c.playerInfo}>
        <div>{data.name}</div>
        <div className={c.steamId}>{data.steamId}</div>
      </div>
    </Link>
  );
};
