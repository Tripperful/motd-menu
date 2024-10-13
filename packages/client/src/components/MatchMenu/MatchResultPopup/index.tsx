import classNames from 'classnames';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes, useParams } from 'react-router-dom';
import { useMatchResult } from 'src/hooks/state/matchResults';
import { useGoBack } from 'src/hooks/useGoBack';
import { CopyOnClick } from '~components/common/CopyOnClick';
import { Popup } from '~components/common/Popup';
import { Spinner } from '~components/common/Spinner';
import { Tabs } from '~components/common/Tabs';
import EfpsIcon from '~icons/efps.svg';
import LinkIcon from '~icons/link.svg';
import PlayersIcon from '~icons/players.svg';
import SkullIcon from '~icons/skull.svg';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';
import { EfpsStatsTab } from './EfpsStatsTab';
import { KillsTab } from './KillsTab';
import { PlayerMatchStats } from './PlayerMatchStats';
import { StatsTab } from './StatsTab';

const useStyles = createUseStyles({
  root: {
    width: 'calc(100vw - 2em)',
    height: 'calc(100vh - 2em)',
    display: 'flex',
    flexDirection: 'column',
  },
  popupTitle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5em',
    flexWrap: 'wrap',
  },
  chip: {
    fontSize: '0.8em',
    padding: '0.2em 0.5em',
    backgroundColor: theme.bg2,
    borderRadius: '0.5em',
    textShadow: '0 0 4px #000b',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  tabHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25em',
    '& > svg': {
      fontSize: '0.5em',
    },
  },
  demoLink: {
    ...activeItem(),
  },
});

const MatchResultPopupTitle: FC<{ matchId: string }> = ({ matchId }) => {
  const c = useStyles();
  const match = useMatchResult(matchId);

  return (
    <>
      <CopyOnClick
        className={classNames(c.chip, c.demoLink)}
        copyText={match.demoLink}
        what="Match demo link"
      >
        <LinkIcon />
        Copy Demo Link
      </CopyOnClick>
      <span className={c.chip}>{match.mapName}</span>
      <span className={c.chip}>{match.server}</span>
      <span className={c.chip}>{match.status}</span>
    </>
  );
};

export const MatchResultPopup: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const { matchId } = useParams();

  return (
    <Popup
      onClose={goBack}
      title={
        <span className={c.popupTitle}>
          <span>Match details</span>
          <Suspense>
            <MatchResultPopupTitle matchId={matchId} />
          </Suspense>
        </span>
      }
      className={c.root}
    >
      <Suspense fallback={<Spinner />}>
        <Tabs
          tabs={[
            {
              label: (
                <span className={c.tabHeader}>
                  <PlayersIcon /> Stats
                </span>
              ),
              content: <StatsTab matchId={matchId} />,
            },
            {
              label: (
                <span className={c.tabHeader}>
                  <SkullIcon /> Kills
                </span>
              ),
              content: <KillsTab matchId={matchId} />,
            },
            {
              label: (
                <span className={c.tabHeader}>
                  <EfpsIcon /> eFPS stats
                </span>
              ),
              content: <EfpsStatsTab matchId={matchId} />,
            },
          ]}
        />
      </Suspense>
      <Routes>
        <Route
          path="player/:steamId/*"
          element={<PlayerMatchStats backPath="../.." />}
        />
      </Routes>
    </Popup>
  );
};
