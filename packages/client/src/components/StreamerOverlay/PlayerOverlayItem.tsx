import React, { FC } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import { createUseStyles } from 'react-jss';
import { theme } from '~styles/theme';
import FlashlightIcon from '~icons/flashlight.svg';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    filter: 'drop-shadow(0 0 2px #000)',
    padding: '0.5em',
    fontSize: '1.5em',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    transition: 'opacity 0.2s ease 0s',
    '@global': {
      '.CircularProgressbar': {
        transition: 'opacity 0.2s ease 0s',
        overflow: 'visible',
        '&-path': {
          transition: 'stroke-dashoffset 0.2s ease 0s',
        },
      },
    },
  },
  nameWrapper: {
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    alignItems: 'end',
    marginRight: '0.25em',
  },
  name: {
    marginRight: '0.25em',
  },
  weapon: {
    transition: 'opacity 0.2s ease 0s',
  },
  score: {
    fontSize: '1.25em',
  },
  deaths: {
    fontSize: '0.8em',
  },
  avatarWrapper: {
    display: 'flex',
    height: '4em',
    width: '4em',
    '> *': {
      width: '100%',
      height: '100%',
    },
    '& > :not(:first-child)': {
      marginLeft: '-4em',
    },
  },
  hpCircle: {
    '& .CircularProgressbar-path': {
      stroke: theme.fgSuccess,
    },
  },
  apCircle: {
    transform: 'scale(0.85)',
    transformOrigin: 'center',
    '& .CircularProgressbar-path': {
      stroke: theme.fgArmor,
      filter: 'drop-shadow(0 0 2px #000)',
    },
  },
  avatarImage: {
    borderRadius: '50%',
    objectFit: 'cover',
    padding: '0.55em',
  },
  hpApWrapper: {
    alignSelf: 'start',
    marginTop: '-0.25em',
    marginLeft: '-0.4em',
    width: '1.8em',
  },
  hpText: {
    color: theme.fgSuccess,
    transition: 'opacity 0.2s ease 0s',
  },
  apText: {
    color: theme.fgArmor,
    fontSize: '0.75em',
    marginTop: '-0.25em',
    marginLeft: '0.65em',
    transition: 'opacity 0.2s ease 0s',
  },
  sprintWrapper: {
    marginLeft: '0.7em',
    marginTop: '0.1em',
    width: '0.35em',
    height: '1.5em',
    backgroundColor: theme.bgInfo,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    transition: 'opacity 0.2s ease 0s',
  },
  sprintValue: {
    width: '100%',
    backgroundColor: theme.fgInfo,
    transition: 'height 0.2s ease 0s',
  },
  flashlightIcon: {
    color: theme.fgInfo,
    fontSize: '0.5em',
    transition: 'opacity 0.2s ease 0s',
    marginLeft: '1em',
  },
});

const maxHp = 100;
const maxAp = 200;

export const PlayerOverlayItem: FC<{
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
  const isAlive = hp > 0;
  const hasArmor = isAlive && ap > 0;

  return (
    <div className={c.root} style={{ opacity: isAlive ? 1 : 0.5 }}>
      <div className={c.nameWrapper}>
        <div className={c.score}>
          {kills}
          <span className={c.deaths}>:{deaths}</span>
        </div>
        <div className={c.name}>{name}</div>
        <div className={c.weapon} style={{ opacity: isAlive ? 1 : 0 }}>
          {weapon}
        </div>
      </div>
      <div className={c.avatarWrapper}>
        <CircularProgressbar
          className={c.hpCircle}
          value={hp}
          maxValue={maxHp}
          strokeWidth={14}
        />
        <CircularProgressbar
          styles={{ root: { opacity: hp > 0 ? 1 : 0 } }}
          className={c.apCircle}
          value={ap}
          maxValue={maxAp}
          strokeWidth={8}
        />
        <img className={c.avatarImage} src={avatarUrl} />
      </div>
      <div className={c.hpApWrapper} style={{ opacity: isAlive ? 1 : 0 }}>
        <div className={c.hpText} style={{ opacity: hp > 0 ? 1 : 0 }}>
          {hp}
        </div>
        <div className={c.apText} style={{ opacity: ap > 0 ? 1 : 0 }}>
          {ap}
        </div>
        <div
          className={c.sprintWrapper}
          style={{ opacity: sprint >= 100 ? 0 : 1 }}
        >
          <div className={c.sprintValue} style={{ height: `${sprint}%` }}></div>
        </div>
        <FlashlightIcon
          className={c.flashlightIcon}
          style={{ opacity: flashlight ? 1 : 0 }}
        />
      </div>
    </div>
  );
};
