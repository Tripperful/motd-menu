import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import { createUseStyles } from 'react-jss';
import { itemNameToIconGlyph } from 'src/util/iconGlyph';
import { teamInfoByIdx } from 'src/util/teams';
import FlashlightIcon from '~icons/flashlight.svg';
import { useGlobalStyles } from '~styles/global';
import { theme } from '~styles/theme';

const vLerp = 0.5; // seconds

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
    fontFamily: "'motd-menu-icons', 'Industry-Bold', sans-serif",
    transition: 'opacity 0.2s ease 0s',
    '@global': {
      '.CircularProgressbar': {
        transition: 'opacity 0.2s ease 0s',
        overflow: 'visible',
        '&-path': {
          transition: `stroke-dashoffset ${vLerp}s ease 0s`,
        },
      },
    },
    userSelect: 'none',
  },
  flipped: {
    transform: 'scaleX(-1)',
  },
  flipped2: {
    transform: 'scaleX(-1)',
    textAlign: 'end',
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
    fontSize: '2em',
    transform: 'scaleX(-1)',
    height: '1em',
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
    overflow: 'hidden',
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
    transition: `height ${vLerp}s ease 0s`,
  },
  flashlightIcon: {
    color: theme.fgInfo,
    fontSize: '0.5em',
    transition: 'opacity 0.2s ease 0s',
    width: '100%',
  },
  blur: {
    filter: 'blur(8px)',
  },
});

const maxHp = 100;
const maxAp = 200;

export const PlayerOverlayItem: FC<{
  teamIdx: number;
  name: string;
  avatarUrl: string;
  kills: number;
  deaths: number;
  hp: number;
  ap: number;
  sprint: number;
  flashlight: boolean;
  weapon: string;
  flip?: boolean;
}> = ({
  teamIdx,
  name,
  avatarUrl,
  kills,
  deaths,
  hp,
  ap,
  sprint,
  flashlight,
  weapon,
  flip,
}) => {
  const c = useStyles();
  useGlobalStyles();
  const isAlive = hp > 0;
  const [blurAvatar, setBlurAvatar] = useState(false);
  const teamInfo = teamInfoByIdx[teamIdx] ?? teamInfoByIdx[0];

  return (
    <div
      className={classNames(c.root, flip && c.flipped)}
      style={{ opacity: isAlive ? 1 : 0.5 }}
    >
      <div className={c.nameWrapper}>
        {kills != null && deaths != null && (
          <div className={classNames(c.score, flip && c.flipped)}>
            {kills}
            <span className={c.deaths}>:{deaths}</span>
          </div>
        )}
        <div
          className={classNames(c.name, flip && c.flipped)}
          style={{ color: teamInfo.color }}
        >
          {name}
        </div>
        <div className={c.weapon} style={{ opacity: isAlive ? 1 : 0 }}>
          {itemNameToIconGlyph(weapon)}
        </div>
      </div>
      <div
        className={classNames(c.avatarWrapper, flip && c.flipped)}
        onClick={() => setBlurAvatar((c) => !c)}
      >
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
        <img
          className={classNames(c.avatarImage, blurAvatar && c.blur)}
          src={avatarUrl}
        />
      </div>
      <div className={c.hpApWrapper} style={{ opacity: isAlive ? 1 : 0 }}>
        <div
          className={classNames(c.hpText, flip && c.flipped2)}
          style={{ opacity: hp > 0 ? 1 : 0 }}
        >
          {hp}
        </div>
        <div
          className={classNames(c.apText, flip && c.flipped2)}
          style={{ opacity: ap > 0 ? 1 : 0 }}
        >
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
