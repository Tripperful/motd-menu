import { MatchSummaryTeam, MatchSummaryTeamPlayer } from '@motd-menu/common';
import React, { FC, Fragment, Suspense, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMatchDeaths } from 'src/hooks/state/matchDeaths';
import { useMatchResult } from 'src/hooks/state/matchResults';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { usePlayersProfiles } from 'src/hooks/usePlayersProfiles';
import { getContrastingColor } from 'src/util/color';
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
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    fontSize: '0.8em',
  },
  title: {
    fontSize: '1.25em',
    textAlign: 'center',
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
  radars: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1em',
  },
  radarGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
          <Fragment key={p.steamId}>
            <div className={c.divider}></div>
            <MatchTeamPlayer key={p.steamId} player={p} />
          </Fragment>
        ))}
    </div>
  );
};

const tooltipStyles: React.CSSProperties = {
  backgroundColor: theme.bg1Thick,
  border: 'none',
  borderRadius: '1em',
};

const MatchResultPopupContent: FC<{ matchId: string }> = ({ matchId }) => {
  const c = useStyles();
  const match = useMatchResult(matchId);
  const deaths = useMatchDeaths(matchId);

  const players = useMemo(() => {
    const players: string[] = [];

    for (const team of match?.teams ?? []) {
      for (const player of team.players) {
        players.push(player.steamId);
      }
    }

    return players;
  }, [match]);

  const scoreDataPoints = useMemo(() => {
    const curKd: Record<string, number> = Object.fromEntries(
      players.map((p) => [p, 0]),
    );

    const scoreDataPoints: ({
      curtime: number;
    } & Record<string, number>)[] = [
      {
        curtime: 0,
        ...Object.fromEntries(players.map((p) => [p, curKd[p]])),
      },
    ];

    for (const death of deaths) {
      const attacker = death.attackerSteamId;
      const victim = death.victimSteamId;

      curKd[attacker] ??= 0;
      curKd[victim] ??= 0;

      curKd[attacker] += death.attackerScoreChange;
      curKd[victim] += death.victimScoreChange;
      curKd[victim] -= 1;

      scoreDataPoints.push({
        curtime: death.curtime - match.startCurtime,
        ...Object.fromEntries(players.map((p) => [p, curKd[p]])),
      });
    }

    return scoreDataPoints;
  }, [deaths, match.startCurtime, players]);

  const playersUsedWeapons = useMemo(() => {
    const playersUsedWeapons: Record<
      string,
      {
        subject: string;
        countUsed: number;
      }[]
    > = {};

    for (const death of deaths) {
      const attacker = death.attackerSteamId;

      if (attacker === '0') continue;

      playersUsedWeapons[attacker] ??= [];

      const weapon = death.weapon;

      const weaponIndex = playersUsedWeapons[attacker].findIndex(
        (w) => w.subject === weapon,
      );

      if (weaponIndex === -1) {
        playersUsedWeapons[attacker].push({
          subject: weapon,
          countUsed: 1,
        });
      } else {
        playersUsedWeapons[attacker][weaponIndex].countUsed++;
      }
    }

    for (const [steamId, weapons] of Object.entries(playersUsedWeapons)) {
      playersUsedWeapons[steamId] = weapons.sort((a, b) =>
        a.subject.localeCompare(b.subject),
      );
    }

    return playersUsedWeapons;
  }, [deaths]);

  const playersProfiles = usePlayersProfiles(players);

  const xTicks: number[] = [];

  for (let i = 0; i <= match.duration; i += 300) {
    xTicks.push(i);
  }

  return (
    <div className={c.content}>
      <div className={c.title}>Score board</div>
      <div className={c.teams}>
        {match?.teams.map((t) => <MatchTeam key={t.index} team={t} />)}
      </div>
      <div className={c.title}>Kills minus deaths graph</div>
      <ResponsiveContainer
        width="100%"
        aspect={2}
        style={{
          paddingRight: '0.5em',
        }}
      >
        <LineChart data={scoreDataPoints}>
          <Legend
            formatter={(value: string) => playersProfiles[value]?.name ?? value}
          />
          <Tooltip
            labelFormatter={(v) => `Time: ${Math.round(v / 60)}m`}
            itemSorter={(item) => -item.value as number}
            formatter={(value: string, name: string) => [
              value,
              playersProfiles[name]?.name ?? name,
            ]}
            contentStyle={tooltipStyles}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#fff2" />
          <XAxis
            dataKey="curtime"
            tickFormatter={(v) => Math.round(v / 60).toString()}
            scale={'time'}
            unit="min"
            type="number"
            ticks={xTicks}
          />
          <YAxis />
          {players.map((steamId, idx) => (
            <Line
              key={steamId}
              dataKey={steamId}
              stroke={getContrastingColor(idx)}
              strokeWidth={4}
              dot={false}
              type="monotone"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className={c.title}>Weapons usage</div>
      <div className={c.radars}>
        {Object.entries(playersUsedWeapons).map(([steamId, weapons]) => (
          <div key={steamId} className={c.radarGroup}>
            <div>{playersProfiles[steamId]?.name ?? steamId}</div>
            <ResponsiveContainer width="100%" aspect={2}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={weapons}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar
                  name="Times killed"
                  dataKey="countUsed"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip contentStyle={tooltipStyles} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ))}
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
