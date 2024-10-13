import React, { useMemo, useState } from 'react';
import { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { MatchKillFeed } from './MatchKillFeed';
import { useMatchDeaths } from 'src/hooks/state/matchDeaths';
import { MatchDeathData } from '@motd-menu/common';
import { itemNameToIconGlyph } from 'src/util/iconGlyph';
import { Toggle } from '~components/common/Toggle';
import EyeIcon from '~icons/eye.svg';
import EyeCrossedIcon from '~icons/eye-crossed.svg';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    overflow: 'hidden scroll',
    marginRight: '-0.5em',
  },
  filters: {
    position: 'sticky',
    top: 0,
  },
  weaponKills: {
    display: 'flex',
    alignItems: 'center',
    gap: '1em',
    fontSize: '0.75em',
  },
  weaponIcon: {
    fontSize: '3em',
    fontWeight: 'normal',
  },
  button: {
    ...outlineButton(),
  },
});

export const KillsTab: FC<{ matchId: string }> = ({ matchId }) => {
  const c = useStyles();
  const matchDeaths = useMatchDeaths(matchId);

  const deathsCountByWeapon = useMemo(
    () =>
      matchDeaths.reduce(
        (acc, death) => {
          acc[death.weapon] = (acc[death.weapon] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [matchDeaths],
  );

  const [showWeaponDeaths, setShowWeaponDeaths] = useState(() =>
    Object.keys(deathsCountByWeapon),
  );

  const filteredDeaths = matchDeaths.filter((death) =>
    showWeaponDeaths.includes(death.weapon),
  );

  return (
    <div className={c.root}>
      <div className={c.filters}>
        <div
          className={c.button}
          onClick={() =>
            setShowWeaponDeaths((c) =>
              c.length > 0 ? [] : Object.keys(deathsCountByWeapon),
            )
          }
        >
          {showWeaponDeaths.length > 0 ? 'Hide all' : 'Show all'}
        </div>
        {Object.entries(deathsCountByWeapon)
          .sort(([, c1], [, c2]) => c2 - c1)
          .map(([weapon, count]) => {
            const active = showWeaponDeaths.includes(weapon);
            return (
              <Toggle
                key={weapon}
                active={active}
                setActive={(a) =>
                  setShowWeaponDeaths((c) => {
                    const filtered = c.filter((w) => w !== weapon);
                    return a ? [...filtered, weapon] : filtered;
                  })
                }
              >
                <div key={weapon} className={c.weaponKills}>
                  {active ? <EyeIcon /> : <EyeCrossedIcon />}
                  <span className={c.weaponIcon}>
                    {itemNameToIconGlyph(weapon)}
                  </span>
                  <span>({count})</span>
                </div>
              </Toggle>
            );
          })}
      </div>
      <MatchKillFeed matchId={matchId} frags={filteredDeaths} />
    </div>
  );
};
