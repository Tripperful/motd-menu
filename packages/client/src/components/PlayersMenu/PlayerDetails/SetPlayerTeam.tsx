import React, { FC, HTMLAttributes } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import { getOnlinePlayers } from 'src/hooks/state/players';
import CombineIcon from '~icons/combine.svg';
import SpecIcon from '~icons/eye.svg';
import RebelIcon from '~icons/lambda.svg';
import { outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';

const teamColors = {
  1: theme.teamColors.spectator,
  2: theme.teamColors.combine,
  3: theme.teamColors.rebel,
};

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
      color: teamColors[teamIndex],
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

  const setTeam = async (teamIndex: 1 | 2 | 3) => {
    const player = (await getOnlinePlayers())?.find(
      (p) => p.steamId === steamId,
    );

    if (!player) {
      addNotification('error', 'Player is offline!');
      return;
    }

    await motdApi.setTeam(teamIndex, player.userId);
  };

  return (
    <div className={c.root}>
      <span>Set team</span>
      <span className={c.buttons}>
        <SetTeamButton teamIndex={1} onClick={() => setTeam(1)}>
          <SpecIcon />
          Spectator
        </SetTeamButton>
        <SetTeamButton teamIndex={2} onClick={() => setTeam(2)}>
          <CombineIcon />
          Combine
        </SetTeamButton>
        <SetTeamButton teamIndex={3} onClick={() => setTeam(3)}>
          <RebelIcon />
          Rebel
        </SetTeamButton>
      </span>
    </div>
  );
};
