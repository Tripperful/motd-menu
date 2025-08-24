import { colorByRank, rgbToHsl } from '@motd-menu/common';
import React, { FC, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { usePlayerStats } from 'src/hooks/state/playerStats';
import { ColoredText } from '~components/common/ColoredText';
import EfpsIcon from '~icons/efps.svg';
import { outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { CustomRank } from './CustomRank';

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
    gap: '0.5em',
    alignItems: 'center',
  },
  value: {
    color: theme.fg1,
  },
  button: {
    ...outlineButton(),
  },
  efpsSection: {
    display: 'flex',
    gap: '1em',
    alignItems: 'flex-start',
  },
});

export const PlayerStats: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();

  const { efpsRank, customRank, customRankExpiresOn } =
    usePlayerStats(steamId) ?? {};

  const efpsRankColorStops = useMemo(
    () => efpsRank && [rgbToHsl(colorByRank(efpsRank.title))],
    [efpsRank],
  );

  return (
    <>
      <div className={c.root}>
        <div className={c.line}>
          <span>Custom rank:</span>
          <CustomRank steamId={steamId} />
        </div>
        <div className={c.efpsSection}>
          {efpsRank && (
            <div className={c.root}>
              <div className={c.line}>
                <span>eFPS Rank:</span>
                <ColoredText
                  text={efpsRank.title}
                  colorStops={efpsRankColorStops}
                />
              </div>
              <div className={c.line}>
                <span>Place:</span>
                <span>
                  <span className={c.value}>{efpsRank.pos}</span>
                  &nbsp;of&nbsp;
                  <span className={c.value}>{efpsRank.max}</span>
                </span>
              </div>
              <div className={c.line}>
                <span>ELO:</span>
                <span className={c.value}>{efpsRank.points}</span>
              </div>
            </div>
          )}
          <Link className={c.button} to="efps">
            <EfpsIcon />
            eFPS stats
          </Link>
        </div>
      </div>
    </>
  );
};
