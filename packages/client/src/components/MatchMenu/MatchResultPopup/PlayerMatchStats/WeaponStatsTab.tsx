import { WeaponType } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useMatchAccuracy } from 'src/hooks/state/matchAccuracy';
import { useMatchDamage } from 'src/hooks/state/matchDamage';
import { useMatchDeaths } from 'src/hooks/state/matchDeaths';
import { itemNameToIconGlyph } from 'src/util/iconGlyph';
import CrosshairIcon from '~icons/crosshair.svg';
import DamageIcon from '~icons/damage.svg';
import HeadshotIcon from '~icons/headshot.svg';
import SkullIcon from '~icons/skull.svg';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  weapons: {
    display: 'flex',
    gap: '1em',
    flexWrap: 'wrap',
  },
  weaponDetails: {
    padding: '1em',
    borderRadius: '0.5em',
    backgroundColor: theme.bg1,
    fontSize: '0.75em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5em',
  },
  weaponIcon: {
    fontSize: '3em',
    fontWeight: 'normal',
  },
  weaponStats: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
});

const weaponsWithAccuracy: WeaponType[] = [
  'pistol',
  '357',
  'smg1',
  'ar2',
  'shotgun',
  'crossbow',
];

export const WeaponStatsTab: FC<{ steamId: string; matchId: string }> = ({
  steamId,
  matchId,
}) => {
  const c = useStyles();

  const kills = useMatchDeaths(matchId)?.filter(
    (d) => d.attackerSteamId === steamId,
  );

  const damage = useMatchDamage(matchId)?.find(
    (d) => d.steamId === steamId,
  ).damageDealtByWeapon;

  const accuracy = useMatchAccuracy(matchId)?.find(
    (a) => a.steamId === steamId,
  );

  const weapons = Object.keys(damage);

  return (
    <div className={c.weapons}>
      {weapons
        .sort((w1, w2) => damage[w2] - damage[w1])
        .map((weapon) => {
          const weaponDamage = damage[weapon];
          const weaponAccuracy =
            accuracy.weaponStats[weapon] ||
            accuracy.weaponStats['weapon_' + weapon];
          const weaponKills = kills.reduce(
            (acc, d) => acc + (d.weapon === weapon ? 1 : 0),
            0,
          );

          return (
            <span key={weapon} className={c.weaponDetails}>
              <span className={c.weaponIcon}>
                {itemNameToIconGlyph(weapon)}
              </span>
              <span className={c.weaponStats}>
                <div className={c.statItem}>
                  <SkullIcon />
                  {weaponKills} kills
                </div>
                <div className={c.statItem}>
                  <DamageIcon />
                  {weaponDamage} hp
                </div>
                {weaponsWithAccuracy.includes(weapon as WeaponType) && (
                  <>
                    <div className={c.statItem}>
                      <CrosshairIcon />
                      {Number(
                        (weaponAccuracy.hit.total / weaponAccuracy.fired) * 100,
                      ).toFixed(2)}
                      %
                    </div>
                    <div className={c.statItem}>
                      <HeadshotIcon />
                      {Number(
                        (weaponAccuracy.hit.hs / weaponAccuracy.fired) * 100,
                      ).toFixed(2)}
                      %
                    </div>
                  </>
                )}
              </span>
            </span>
          );
        })}
    </div>
  );
};
