import { SteamPlayerData } from '@motd-menu/common';
import classNames from 'classnames';
import React, { forwardRef, HTMLAttributes } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';
import { Flag } from './Flag';

export const useStyles = createUseStyles({
  root: {
    padding: '0.5em',
    display: 'flex',
    backgroundColor: theme.bg1,
    borderRadius: '0.5em',
    position: 'relative',
    alignItems: 'center',
  },
  active: {
    ...activeItem(),
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
    gap: '0.25em',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  nameWrapper: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  name: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  aka: {
    fontSize: '0.8em',
    color: theme.fg3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ping: {
    position: 'absolute',
    right: '0',
    top: '0.25em',
    transform: 'translateY(-50%)',
    backgroundColor: '#000f',
    borderRadius: '0.5em',
    padding: '0.1em 0.5em',
    fontSize: '0.7em',
  },
});

export const PlayerItem = forwardRef<
  HTMLDivElement,
  {
    profile: SteamPlayerData;
    link?: string;
    aka?: string;
    ping?: number;
    onClick?: (steamId: string) => void;
    before?: React.ReactNode;
    after?: React.ReactNode;
  } & HTMLAttributes<HTMLDivElement> &
    ClassNameProps
>(
  (
    { profile, className, link, aka, ping, onClick, before, after, ...attrs },
    ref,
  ) => {
    const c = useStyles();
    const countryCode = profile.geo?.countryCode;

    const content = (
      <>
        {before}
        <img className={c.avatar} src={profile.avatar} />
        <div className={c.playerInfo}>
          <div className={c.nameWrapper}>
            {countryCode && <Flag code={countryCode} />}
            <span className={c.name}>{profile.name}</span>
          </div>
          {aka && aka !== profile.name ? (
            <div className={c.aka}>({aka})</div>
          ) : null}
        </div>
        {ping != null ? <div className={c.ping}>{ping} ms</div> : null}
        {after}
      </>
    );

    const cn = classNames(c.root, { [c.active]: link || onClick }, className);

    return link ? (
      <Link className={cn} to={link}>
        {content}
      </Link>
    ) : (
      <div
        ref={ref}
        className={cn}
        onClick={onClick ? () => onClick(profile.steamId) : null}
        {...attrs}
      >
        {content}
      </div>
    );
  },
);
