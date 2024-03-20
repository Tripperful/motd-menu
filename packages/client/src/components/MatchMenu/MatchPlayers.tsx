import { OnlinePlayerInfo } from '@motd-menu/common';
import React, {
  FC,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createUseStyles } from 'react-jss';
import { useOnlinePlayers } from 'src/hooks/state/players';
import { useAvailableTeams } from 'src/hooks/useAvailableTeams';
import { teamInfoByIdx } from 'src/util/teams';
import CombineIcon from '~icons/combine.svg';
import EyeIcon from '~icons/eye.svg';
import LambdaIcon from '~icons/lambda.svg';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';
import { StartMatchSettingsContext } from './StartMatchMenu';

const useStyles = createUseStyles({
  root: {
    flex: '1 1 auto',
    display: 'flex',
    padding: '0.5em',
    minHeight: 0,
  },
  content: {
    display: 'flex',
    minWidth: 0,
    flex: '1 1 auto',
    gap: '0.5em',
    minHeight: 0,
  },
  playerList: {
    backgroundColor: theme.bg1,
    padding: '0.5em',
    overflow: 'hidden auto',
    gap: '0.5em',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flex: '1 1 0',
    borderRadius: '0.5em',
  },
  playerListHeader: {
    alignSelf: 'center',
    position: 'sticky',
    top: 0,
  },
  playerItem: {
    backgroundColor: theme.bg1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.25em 0.5em',
    borderRadius: '0.5em',
  },
  playerName: {
    flex: '1 1 auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playerTeamButtons: {
    flex: '0 0 auto',
    display: 'flex',
    gap: '0.5em',
    fontSize: '0.75em',
  },
  playerTeamButton: {
    ...activeItem(),
    display: 'flex',
  },
});

const teamIcons = {
  1: <EyeIcon />,
  2: <CombineIcon />,
  3: <LambdaIcon />,
};

const SetTeamButton: FC<{
  teamIndex: number;
  setTeamIndex: (teamIndex: number) => void;
}> = ({ teamIndex, setTeamIndex }) => {
  const c = useStyles(teamIndex);

  return (
    <div
      className={c.playerTeamButton}
      style={{ color: teamInfoByIdx[teamIndex].color }}
      onClick={() => setTeamIndex(teamIndex)}
    >
      {teamIcons[teamIndex]}
    </div>
  );
};

const MatchPlayerItem: FC<{
  player: OnlinePlayerInfo;
  teamIndex: number;
  setTeamIndex: (teamIndex: number) => void;
}> = ({ player, teamIndex, setTeamIndex }) => {
  const c = useStyles(teamIndex);
  const availableTeams = useAvailableTeams();

  return (
    <div className={c.playerItem}>
      <span style={{ color: teamInfoByIdx[teamIndex].color }}>
        {player.steamProfile?.name ?? player.steamId}
      </span>
      <span className={c.playerTeamButtons}>
        {availableTeams
          .filter((t) => t.index !== teamIndex)
          .map((t) => (
            <SetTeamButton
              key={t.index}
              teamIndex={t.index}
              setTeamIndex={setTeamIndex}
            />
          ))}
      </span>
    </div>
  );
};

type MatchPlayerInfo = OnlinePlayerInfo & { teamIndex: number };

const TeamList: FC<{
  players: MatchPlayerInfo[];
  teamIndex: number;
  setPlayerTeam: (steamId: string, teamIndex: number) => void;
}> = ({ players, teamIndex, setPlayerTeam }) => {
  const c = useStyles(teamIndex);

  const teamPlayers = useMemo(
    () => players.filter((p) => p.teamIndex === teamIndex),
    [players, teamIndex],
  );

  const teamInfo = teamInfoByIdx[teamIndex];

  return (
    <div className={c.playerList}>
      <div className={c.playerListHeader} style={{ color: teamInfo.color }}>
        {teamInfo.name}
      </div>
      {teamPlayers?.map((player) => (
        <MatchPlayerItem
          key={player.steamId}
          player={player}
          teamIndex={player.teamIndex}
          setTeamIndex={(teamIndex: number) =>
            setPlayerTeam(player.steamId, teamIndex)
          }
        />
      ))}
    </div>
  );
};

const MatchPlayersContent: FC = () => {
  const c = useStyles();

  const onlinePlayers = useOnlinePlayers();
  const [players, setPlayers] = useState<MatchPlayerInfo[]>(
    () => onlinePlayers?.map((p) => ({ ...p, teamIndex: 1 })),
  );

  const availableTeams = useAvailableTeams();

  const setPlayerTeam = useCallback((steamId: string, teamIndex: number) => {
    setPlayers((cur) => {
      const player = cur.find((p) => p.steamId === steamId);

      if (!player || player.teamIndex === teamIndex) return cur;

      return cur.map((p) => (p.steamId === steamId ? { ...p, teamIndex } : p));
    });
  }, []);

  const { setPlayers: setMatchPlayers } = useContext(StartMatchSettingsContext);

  useEffect(() => {
    setMatchPlayers(
      Object.fromEntries(players.map((p) => [p.steamId, p.teamIndex])),
    );
  }, [players, setMatchPlayers]);

  return (
    <div className={c.content}>
      {availableTeams.map((t) => (
        <TeamList
          key={t.index}
          players={players}
          teamIndex={t.index}
          setPlayerTeam={setPlayerTeam}
        />
      ))}
    </div>
  );
};

export const MatchPlayers: FC = () => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <Suspense>
        <MatchPlayersContent />
      </Suspense>
    </div>
  );
};
