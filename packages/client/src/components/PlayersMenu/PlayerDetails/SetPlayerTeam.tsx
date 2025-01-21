import React, { FC, HTMLAttributes } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import { getOnlinePlayers } from 'src/hooks/state/players';
import { useAvailableTeams } from 'src/hooks/useAvailableTeams';
import { teamInfoByIdx } from 'src/util/teams';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  buttons: {
    display: 'flex',
    gap: '0.5em',
    whiteSpace: 'nowrap',
    flexWrap: 'wrap',
    fontSize: '0.75em',
  },
  button: (teamIndex: number) => ({
    ...outlineButton(),
    '&&': {
      color: teamInfoByIdx(teamIndex).color,
    },
  }),
});

const SetTeamButton: FC<
  HTMLAttributes<HTMLDivElement> & { teamIndex: number }
> = ({ children, teamIndex, ...props }) => {
  const c = useStyles(teamIndex);

  return (
    <div className={c.button} {...props}>
      {children}
    </div>
  );
};

export const SetPlayerTeam: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();

  const setTeam = async (teamIndex: number) => {
    const player = (await getOnlinePlayers())?.find(
      (p) => p.steamId === steamId,
    );

    if (!player) {
      addNotification('error', 'Player is offline!');
      return;
    }

    await motdApi.setTeam(teamIndex, player.userId);
  };

  const availableTeams = useAvailableTeams();

  return (
    <div className={c.root}>
      <span>Set team</span>
      <span className={c.buttons}>
        {availableTeams.map((t) => (
          <SetTeamButton
            key={t.index}
            teamIndex={t.index}
            onClick={() => setTeam(t.joinIndex)}
          >
            {t.icon}
            {t.name}
          </SetTeamButton>
        ))}
      </span>
    </div>
  );
};
