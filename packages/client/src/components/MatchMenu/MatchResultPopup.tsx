import { MatchSummaryTeam, MatchSummaryTeamPlayer } from '@motd-menu/common';
import { WeaponType } from '@motd-menu/common/src/types/weapons';
import React, { FC, Fragment, Suspense, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { usePlayersProfiles } from 'src/hooks/usePlayersProfiles';
import { getContrastingColor } from 'src/util/color';
import { IconGlyph, weaponIconsGlyphs } from 'src/util/iconGlyph';
import { teamInfoByIdx } from 'src/util/teams';
import { PlayerDetails } from '~components/PlayersMenu/PlayerDetails';
import { Popup } from '~components/common/Popup';
import { Spinner } from '~components/common/Spinner';
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
  weaponIcon: {
    fontSize: '3em',
    transform: 'translateX(-50%)',
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

  const teamTotalKills = team.players.reduce((acc, p) => acc + p.kills, 0);
  const teamInfo = teamInfoByIdx[team.index];

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

const MatchResultPopupContent: FC<{ matchId: string }> = ({ matchId }) => {
  const c = useStyles();
  const match = useMatchResult(matchId);
  const deaths = useMatchDeaths(matchId);
  const damage = useMatchDamage(matchId);

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

  const killsByWeapon = useMemo(() => {
    const killsByWeapon: Record<string, Record<string, number | string>> = {};

    for (const death of deaths) {
      const attacker = death.attackerSteamId;
      if (attacker === '0') continue;

      const weapon = death.weapon;
      killsByWeapon[weapon] ??= { weapon };

      killsByWeapon[weapon][attacker] ??= 0;
      (killsByWeapon[weapon][attacker] as number)++;
    }

    const res = Object.values(killsByWeapon).sort((a, b) => {
      const aTotal = Object.values(a).reduce(
        (acc: number, v) => acc + (typeof v === 'number' ? v : 0),
        0,
      ) as number;

      const bTotal = Object.values(b).reduce(
        (acc: number, v) => acc + (typeof v === 'number' ? v : 0),
        0,
      ) as number;

      return bTotal - aTotal;
    });

    return res;
  }, [deaths]);

  const damageByWeapon = useMemo(() => {
    const damageByWeapon: Record<string, Record<string, number>> = {};

    for (const d of damage) {
      const { steamId, damageDealtByWeapon } = d;

      for (const [weapon, damage] of Object.entries(damageDealtByWeapon)) {
        damageByWeapon[weapon] ??= {};
        damageByWeapon[weapon][steamId] ??= 0;
        damageByWeapon[weapon][steamId] += damage;
      }
    }

    return Object.entries(damageByWeapon)
      .map(([weapon, damage]) => ({
        weapon,
        ...damage,
      }))
      .sort((a, b) => {
        const aTotal = Object.values(a).reduce(
          (acc: number, v) => acc + (typeof v === 'number' ? v : 0),
          0,
        ) as number;

        const bTotal = Object.values(b).reduce(
          (acc: number, v) => acc + (typeof v === 'number' ? v : 0),
          0,
        ) as number;

        return bTotal - aTotal;
      });
  }, [damage]);

  const playersProfiles = usePlayersProfiles(players);

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
      <div className={c.title}>Score board</div>
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
            unit=" min"
            type="number"
            ticks={xTicks}
            tickMargin={10}
          />
          <YAxis />
          {players.map((steamId, idx) => (
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
      <div className={c.title}>Kills by weapon</div>
      <ResponsiveContainer
        width="100%"
        aspect={3}
        style={{
          paddingRight: '0.5em',
        }}
      >
        <BarChart data={killsByWeapon} margin={{ top: 30 }}>
          <Legend
            formatter={(value: string) => playersProfiles[value]?.name ?? value}
          />
          <Tooltip
            itemSorter={(item) => -item.value as number}
            formatter={(value: string, name: string) => [
              value + ' kills',
              playersProfiles[name]?.name ?? name,
            ]}
            contentStyle={tooltipStyles}
            cursor={{ fill: '#fff2' }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#fff2" />
          <XAxis dataKey="weapon" tick={false} />
          <YAxis />
          {players.map((steamId, idx) => (
            <Bar
              key={steamId}
              dataKey={steamId}
              opacity={0.5}
              activeBar={{ opacity: 1 }}
              stackId="a"
              fill={getContrastingColor(idx)}
            >
              {idx === players.length - 1 && (
                <LabelList
                  dataKey="weapon"
                  position="centerTop"
                  content={({ x, y, width, value }) => (
                    <g transform={`translate(${+x + +width / 2}, ${+y - 10})`}>
                      <text
                        fill="currentColor"
                        textAnchor="middle"
                        fontSize="2em"
                        fontWeight="normal"
                      >
                        {weaponIconsGlyphs[value as WeaponType] ??
                          IconGlyph.Suicide}
                      </text>
                    </g>
                  )}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className={c.title}>Damage by weapon</div>
      <ResponsiveContainer
        width="100%"
        aspect={3}
        style={{
          paddingRight: '0.5em',
        }}
      >
        <BarChart data={damageByWeapon} margin={{ top: 30 }}>
          <Legend
            formatter={(value: string) => playersProfiles[value]?.name ?? value}
          />
          <Tooltip
            itemSorter={(item) => -item.value as number}
            formatter={(value: string, name: string) => [
              value + ' hp',
              playersProfiles[name]?.name ?? name,
            ]}
            contentStyle={tooltipStyles}
            cursor={{ fill: '#fff2' }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#fff2" />
          <XAxis dataKey="weapon" tick={false} />
          <YAxis />
          {players.map((steamId, idx) => (
            <Bar
              key={steamId}
              dataKey={steamId}
              opacity={0.5}
              activeBar={{ opacity: 1 }}
              stackId="a"
              fill={getContrastingColor(idx)}
            >
              {idx === players.length - 1 && (
                <LabelList
                  dataKey="weapon"
                  position="centerTop"
                  content={({ x, y, width, value }) => (
                    <g transform={`translate(${+x + +width / 2}, ${+y - 10})`}>
                      <text
                        fill="currentColor"
                        textAnchor="middle"
                        fontSize="2em"
                        fontWeight="normal"
                      >
                        {weaponIconsGlyphs[value as WeaponType] ??
                          IconGlyph.Suicide}
                      </text>
                    </g>
                  )}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MatchResultPopup: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const { matchId } = useParams();

  return (
    <Popup onClose={goBack} title="Match details" className={c.root}>
      <Suspense fallback={<Spinner />}>
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
