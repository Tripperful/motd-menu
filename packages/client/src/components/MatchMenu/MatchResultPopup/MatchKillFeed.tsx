import { MatchDeathData } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useMatchResult } from 'src/hooks/state/matchResults';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { itemNameToIconGlyph } from 'src/util/iconGlyph';
import { teamInfoByIdx } from 'src/util/teams';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    fontSize: '0.75em',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    flex: '1 1 auto',
    alignItems: 'flex-end',
  },
  killFeedItemWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '1em',
  },
  killFeedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1em',
    padding: '0.5em 1em',
    borderRadius: '1em 0 0 1em',
    backgroundColor: theme.bg1,
    borderWidth: '0 0.5em 0 0',
    borderStyle: 'solid',
    borderColor: theme.fgError,
  },
  fragItem: {
    borderColor: theme.fgSuccess,
  },
  teamKillItem: {
    borderColor: theme.fgInfo,
  },
  killFeedIcon: {
    fontSize: '2em',
    fontWeight: 'normal',
  },
});

const KillFeedItem: FC<{
  frag: MatchDeathData;
  attackerTeam: number;
  victimTeam: number;
}> = ({ frag, attackerTeam, victimTeam }) => {
  const c = useStyles();

  const {
    attackerSteamId,
    victimSteamId,
    weapon,
    curtime,
    attackerScoreChange,
  } = frag;

  const attackerProfile = usePlayerSteamProfile(attackerSteamId);
  const victimProfile = usePlayerSteamProfile(victimSteamId);

  const min = Math.floor(curtime / 60)
    .toString()
    .padStart(2, '0');
  const sec = Math.floor(curtime % 60)
    .toString()
    .padStart(2, '0');

  const attackerTeamColor = teamInfoByIdx(attackerTeam).color;
  const victimTeamColor = teamInfoByIdx(victimTeam).color;

  const isFrag = attackerScoreChange > 0;
  const isTeamKill =
    attackerTeam === victimTeam && attackerSteamId !== victimSteamId;

  return (
    <div className={c.killFeedItemWrapper}>
      <span>
        {min}:{sec}
      </span>
      <div
        className={classNames(
          c.killFeedItem,
          isFrag && c.fragItem,
          isTeamKill && c.teamKillItem,
        )}
      >
        {attackerSteamId && attackerSteamId !== '0' && (
          <span style={{ color: attackerTeamColor }}>
            {attackerProfile.name}
          </span>
        )}
        <span className={c.killFeedIcon}>{itemNameToIconGlyph(weapon)}</span>
        {victimSteamId && victimSteamId !== '0' && (
          <span style={{ color: victimTeamColor }}>{victimProfile.name}</span>
        )}
      </div>
    </div>
  );
};

export const MatchKillFeed: FC<{
  matchId: string;
  frags: MatchDeathData[];
}> = ({ matchId, frags }) => {
  const c = useStyles();
  const match = useMatchResult(matchId);

  const playersTeams: Record<string, number> = {};

  for (const team of match.teams) {
    for (const player of team.players) {
      playersTeams[player.steamId] = team.index;
    }
  }

  return (
    <div className={c.root}>
      {frags.map((frag, idx) => {
        return (
          <KillFeedItem
            key={idx}
            frag={frag}
            attackerTeam={playersTeams[frag.attackerSteamId]}
            victimTeam={playersTeams[frag.victimSteamId]}
          />
        );
      })}
    </div>
  );
};
