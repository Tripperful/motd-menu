import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { usePlayerStats } from 'src/hooks/state/playerStats';
import { theme } from '~styles/theme';
import EfpsIcon from '~icons/efps.svg';
import { Link } from 'react-router-dom';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
    color: theme.fg1,
  },
  line: {
    display: 'flex',
    paddingLeft: '0.5em',
    gap: '0.5em',
  },
  value: {
    color: theme.fg1,
  },
  button: {
    ...outlineButton(),
  },
});

export const PlayerStats: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();

  const { efpsRank } = usePlayerStats(steamId);
  const { r, g, b, pos, max, points } = efpsRank ?? {};

  return (
    <>
      {efpsRank && (
        <div className={c.root}>
          <div className={c.sectionHeader}>
            <Link className={c.button} to="efps">
              <EfpsIcon />
              eFPS stats
            </Link>
          </div>
          <div className={c.line}>
            <span>Rank:</span>
            <span style={{ color: `rgb(${r} ${g} ${b})` }}>
              {efpsRank.rank}
            </span>
          </div>
          <div className={c.line}>
            <span>Place:</span>
            <span>
              <span className={c.value}>{pos}</span>
              &nbsp;of&nbsp;
              <span className={c.value}>{max}</span>
            </span>
          </div>
          <div className={c.line}>
            <span>Points:</span>
            <span className={c.value}>{points}</span>
          </div>
        </div>
      )}
    </>
  );
};
