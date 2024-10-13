import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useMiscPlayerMatchStats } from 'src/hooks/state/miscPlayerMatchStats';
import { itemNameToIconGlyph } from 'src/util/iconGlyph';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2em',
    fontSize: '0.75em',
    overflow: 'hidden scroll',
    marginRight: '-0.5em',
  },
  title: {
    fontSize: '1.25em',
    marginBottom: '0.5em',
  },
  tiles: {
    display: 'flex',
    gap: '1em',
    flexWrap: 'wrap',
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5em',
    backgroundColor: theme.bg1,
    padding: '1em',
    borderRadius: '0.5em',
  },
  chargerIcon: {
    fontSize: '8em',
    fontWeight: 'normal',
  },
  pickupIcon: {
    fontSize: '3em',
    fontWeight: 'normal',
  },
});

export const MiscStatsTab: FC<{ steamId: string; matchId: string }> = ({
  steamId,
  matchId,
}) => {
  const c = useStyles();

  const { chargerUses, pickups, catches } = useMiscPlayerMatchStats(
    matchId,
    steamId,
  );

  return (
    <div className={c.root}>
      {chargerUses && (chargerUses.hpConsumed || chargerUses.apConsumed) && (
        <div>
          <div className={c.title}>Charger usage</div>
          <div className={c.tiles}>
            <div className={c.tile}>
              <span className={c.chargerIcon}>
                {itemNameToIconGlyph('charger')}
              </span>
              <span>{Math.floor(chargerUses.hpConsumed)} health</span>
              <span>{Math.floor(chargerUses.apConsumed)} armor</span>
            </div>
          </div>
        </div>
      )}
      {catches && (
        <div>
          <div className={c.title}>Catches</div>
          <div className={c.tiles}>
            {catches.prop_combine_ball && (
              <div className={c.tile}>
                <span className={c.pickupIcon}>
                  {itemNameToIconGlyph('combine_ball')}
                </span>
                <span>x{catches.prop_combine_ball}</span>
              </div>
            )}
            {catches.npc_grenade_frag && (
              <div className={c.tile}>
                <span className={c.pickupIcon}>
                  {itemNameToIconGlyph('frag')}
                </span>
                <span>x{catches.npc_grenade_frag}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {pickups && (
        <div>
          <div className={c.title}>Pickups</div>
          <div className={c.tiles}>
            {Object.entries(pickups)
              .sort(([, a], [, b]) => b - a)
              .map(([item, count]) => (
                <div key={item} className={c.tile}>
                  <span className={c.pickupIcon}>
                    {itemNameToIconGlyph(item)}
                  </span>
                  <span>x{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
