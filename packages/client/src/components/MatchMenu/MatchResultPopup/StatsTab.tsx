import {
  getContrastingColor,
  MatchSummaryTeam,
  MatchSummaryTeamPlayer,
} from '@motd-menu/common';
import React, { FC, Fragment, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMatchDamage } from 'src/hooks/state/matchDamage';
import { useMatchDeaths } from 'src/hooks/state/matchDeaths';
import { useMatchResult } from 'src/hooks/state/matchResults';
import { teamInfoByIdx } from 'src/util/teams';
import { Flag } from '~components/common/Flag';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  content: {
    flex: '1 1 auto',
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
    position: 'relative',
    textWrap: 'nowrap',
    borderRadius: '0.5em',
    overflow: 'hidden',
  },
  teamScoreHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  teamIcon: {
    fontSize: '0.75em',
    display: 'flex',
  },
  scoreboardBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    opacity: 0.2,
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

const MatchTeamPlayer: FC<{
  player: MatchSummaryTeamPlayer;
}> = ({ player }) => {
  const c = useStyles();
  const { profile } = player;
  const countryCode = profile.geo?.countryCode;

  return (
    <>
      <Link to={`player/${player.steamId}`} className={c.player}>
        <img src={profile.avatar} className={c.avatar} />
        {countryCode && <Flag code={countryCode} />}
        <span>{profile.name}</span>
      </Link>
      <span className={c.alignCenter}>{player.kills}</span>
      <span className={c.alignCenter}>{player.deaths}</span>
    </>
  );
};

const MatchTeam: FC<{ team: MatchSummaryTeam }> = ({ team }) => {
  const c = useStyles();

  const teamTotalKills = team.players.reduce((acc, p) => acc + p.kills, 0);
  const teamInfo = teamInfoByIdx(team.index);

  return (
    <div className={c.scoreboardGrid}>
      <div
        className={c.scoreboardBg}
        style={{ backgroundColor: teamInfo.color }}
      ></div>
      <div className={c.teamScoreHeader}>
        <span style={{ color: teamInfo.color }} className={c.teamIcon}>
          {teamInfo.icon}
        </span>
        {team.name} ({teamTotalKills})
      </div>
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

export const StatsTab: FC<{ matchId: string }> = ({ matchId }) => {
  const c = useStyles();
  const match = useMatchResult(matchId);
  const deaths = useMatchDeaths(matchId);

  const players = useMemo(
    () => match?.teams?.flatMap((team) => team.players),
    [match],
  );

  const playersBySteamId = useMemo(
    () => Object.fromEntries(players.map((p) => [p.steamId, p])),
    [players],
  );

  const scoreDataPoints = useMemo(() => {
    const curKd: Record<string, number> = Object.fromEntries(
      players.map(({ steamId }) => [steamId, 0]),
    );

    const scoreDataPoints: ({
      curtime: number;
    } & Record<string, number>)[] = [
      {
        curtime: 0,
        ...Object.fromEntries(
          players.map(({ steamId }) => [steamId, curKd[steamId]]),
        ),
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
        ...Object.fromEntries(
          players.map(({ steamId }) => [steamId, curKd[steamId]]),
        ),
      });
    }

    return scoreDataPoints;
  }, [deaths, match.startCurtime, players]);

  const xTicks: number[] = [];

  for (let i = 0; i <= match.duration; i += 300) {
    xTicks.push(i);
  }

  const sortedTeams = useMemo(
    () =>
      [...(match?.teams ?? [])].sort((a, b) => {
        const teamATotalKills = a.players.reduce((acc, p) => acc + p.kills, 0);
        const teamBTotalKills = b.players.reduce((acc, p) => acc + p.kills, 0);

        return teamBTotalKills - teamATotalKills;
      }),
    [match.teams],
  );

  return (
    <div className={c.content}>
      <div className={c.teams}>
        {sortedTeams.map((t) => (
          <MatchTeam key={t.index} team={t} />
        ))}
      </div>
      <div className={c.title}>Kills minus deaths graph</div>
      <ResponsiveContainer
        width="100%"
        aspect={3}
        style={{
          paddingRight: '0.5em',
        }}
      >
        <LineChart data={scoreDataPoints}>
          <Legend
            formatter={(value: string) =>
              playersBySteamId[value]?.profile?.name ?? value
            }
          />
          <Tooltip
            labelFormatter={(v) => `Time: ${Math.round(v / 60)}m`}
            itemSorter={(item) => -item.value as number}
            formatter={(value: string, name: string) => [
              value,
              playersBySteamId[name]?.profile?.name ?? name,
            ]}
            contentStyle={tooltipStyles}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#fff2" />
          <XAxis
            dataKey="curtime"
            tickFormatter={(v) => Math.round(v / 60).toString()}
            scale={'time'}
            unit=" min"
            type="number"
            ticks={xTicks}
            tickMargin={10}
          />
          <YAxis />
          {players.map(({ steamId }, idx) => (
            <Line
              key={steamId}
              dataKey={steamId}
              stroke={getContrastingColor(idx)}
              strokeWidth={2}
              dot={false}
              type="monotone"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
