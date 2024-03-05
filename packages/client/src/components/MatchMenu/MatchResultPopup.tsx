import { MatchSummaryTeam, MatchSummaryTeamPlayer } from '@motd-menu/common';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { useMatchResult } from 'src/hooks/state/matchResults';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { PlayerDetails } from '~components/PlayersMenu/PlayerDetails';
import { Popup } from '~components/common/Popup';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    width: 'calc(100vw - 2em)',
    height: 'calc(100vh - 2em)',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden scroll',
    marginRight: '-0.5em',
    paddingRight: '0.5em',
  },
  teams: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
  scoreboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 3em 3em',
    gap: '0.5em',
    alignItems: 'center',
    padding: '1em',
    backgroundColor: theme.bg1,
  },
  player: {
    justifySelf: 'start',
    ...activeItem(),
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  divider: {
    gridColumn: '1 / -1',
    height: '2px',
    backgroundColor: theme.bg2,
  },
  alignCenter: {
    textAlign: 'center',
  },
  avatar: {
    width: '3em',
    height: '3em',
    margin: '0.25em',
    borderRadius: '0.5em',
  },
});

const MatchTeamPlayer: FC<{ player: MatchSummaryTeamPlayer }> = ({
  player,
}) => {
  const c = useStyles();
  const profile = usePlayerSteamProfile(player.steamId);

  return (
    <>
      <Link to={`player/${player.steamId}`} className={c.player}>
        <img src={profile.avatar} className={c.avatar} />
        <span>{profile.name}</span>
      </Link>
      <span className={c.alignCenter}>{player.kills}</span>
      <span className={c.alignCenter}>{player.deaths}</span>
    </>
  );
};

const MatchTeam: FC<{ team: MatchSummaryTeam }> = ({ team }) => {
  const c = useStyles();

  return (
    <div className={c.scoreboardGrid}>
      <div>{team.name}</div>
      <div className={c.alignCenter}>Kills</div>
      <div className={c.alignCenter}>Deaths</div>
      {team.players
        .sort((p1, p2) => {
          const diff = p2.kills - p1.kills;

          if (diff !== 0) {
            return diff;
          }

          return p1.deaths - p2.deaths;
        })
        .map((p) => (
          <>
            <div className={c.divider}></div>
            <MatchTeamPlayer key={p.steamId} player={p} />
          </>
        ))}
    </div>
  );
};

const MatchResultPopupContent: FC<{ matchId: string }> = ({ matchId }) => {
  const c = useStyles();
  const match = useMatchResult(matchId);

  return (
    <div className={c.content}>
      <div className={c.teams}>
        {match?.teams.map((t) => <MatchTeam key={t.index} team={t} />)}
      </div>
    </div>
  );
};

export const MatchResultPopup: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const { matchId } = useParams();

  return (
    <Popup onClose={goBack} title="Match details" className={c.root}>
      <Suspense>
        <MatchResultPopupContent matchId={matchId} />
      </Suspense>
      <Routes>
        <Route
          path="player/:steamId/*"
          element={<PlayerDetails backPath="../.." />}
        />
      </Routes>
    </Popup>
  );
};
