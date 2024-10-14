import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { SidePanel } from '~components/common/SidePanel';
import { Tabs } from '~components/common/Tabs';
import { PlayerDetails } from '~components/PlayersMenu/PlayerDetails';
import { activeItemNoTransform } from '~styles/elements';
import { MiscStatsTab } from './MiscStatsTab';
import { WeaponStatsTab } from './WeaponStatsTab';
import { itemNameToIconGlyph } from 'src/util/iconGlyph';

const useStyles = createUseStyles({
  root: {
    padding: '1em',
  },
  playerTitle: {
    ...activeItemNoTransform(),
  },
  killStats: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
  },
  title: {
    fontSize: '1.25em',
    textAlign: 'center',
  },
  icon: {
    fontWeight: 'normal',
  },
});

const PlayerStats: FC<{ steamId: string; matchId: string }> = ({
  steamId,
  matchId,
}) => {
  const c = useStyles();

  return (
    <>
      <Tabs
        className={c.root}
        tabs={[
          {
            label: (
              <span>
                <span className={c.icon}>{itemNameToIconGlyph('smg1')}</span>
                &nbsp;Weapons
              </span>
            ),
            content: <WeaponStatsTab steamId={steamId} matchId={matchId} />,
          },
          {
            label: (
              <span>
                <span className={c.icon}>{itemNameToIconGlyph('battery')}</span>
                &nbsp;Misc
              </span>
            ),
            content: <MiscStatsTab steamId={steamId} matchId={matchId} />,
          },
        ]}
      />
      <Routes>
        <Route path="profile/*" element={<PlayerDetails />} />
      </Routes>
    </>
  );
};

const SidePanelTitle: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const profile = usePlayerSteamProfile(steamId);

  return (
    <h2>
      Match stats (
      <Link to="profile" className={c.playerTitle}>
        {profile.name}
      </Link>
      )
    </h2>
  );
};

export const PlayerMatchStats: FC<{ backPath?: string }> = ({ backPath }) => {
  const { matchId, steamId } = useParams();

  return (
    <SidePanel
      title={
        <Suspense fallback={<h2>Match stats</h2>}>
          <SidePanelTitle steamId={steamId} />
        </Suspense>
      }
      backPath={backPath}
    >
      <PlayerStats matchId={matchId} steamId={steamId} />
    </SidePanel>
  );
};
