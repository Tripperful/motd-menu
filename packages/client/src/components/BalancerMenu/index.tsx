import { BalancedTeamsData } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import { useOnlinePlayers } from 'src/hooks/state/players';
import { ActionPage } from '~components/common/Page/ActionPage';
import { Switch } from '~components/common/Switch';
import { PlayersListItem } from '~components/PlayersMenu/PlayersList/PlayersListItem';
import BalanceIcon from '~icons/balance.svg';
import { outlineButton, verticalScroll } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    gap: '1em',
    minHeight: 0,
    '& > *': {
      flex: '1 1 100%',
      minWidth: 0,
    },
    ...verticalScroll(),
  },
  title: {
    fontSize: '1.5em',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    minHeight: 'min-content',
  },
  selected: {
    backgroundImage: `linear-gradient(45deg, ${theme.bg1}, ${theme.fg3})`,
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  button: {
    fontSize: '1.2em',
    ...outlineButton(),
  },
  teams: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
  team: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    padding: '0.5em',
    backgroundColor: theme.bg2,
    borderRadius: '0.5em',
  },
  teamTitle: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: theme.fg1,
  },
  nowrap: {
    whiteSpace: 'nowrap',
  },
});

const BalancerMenu: FC = () => {
  const c = useStyles();

  const onlinePlayers = useOnlinePlayers();

  const [selectedPlayers, setSelectedPlayers] = React.useState(() =>
    onlinePlayers.filter((p) => p.teamIdx !== 1).map((p) => p.steamId),
  );

  const [balancedTeams, setBalancedTeams] = useState<BalancedTeamsData>(null);

  useEffect(() => {
    if (selectedPlayers.length < 3) {
      setBalancedTeams(null);
      return;
    }
    motdApi.getBalancedTeams(selectedPlayers).then(setBalancedTeams);
  }, [selectedPlayers]);

  return (
    <ActionPage
      title="Team Balancer"
      actions={[
        {
          action: () => {
            motdApi
              .applyBalancedTeams(selectedPlayers)
              .then(() => motdApi.closeMenu())
              .catch((e) => {
                addNotification(
                  'error',
                  typeof e === 'string' ? e : 'Failed to apply teams',
                );
              });
          },
          disabled: !balancedTeams?.length,
          children: (
            <>
              <BalanceIcon />
              Apply selected teams
            </>
          ),
        },
      ]}
    >
      <div className={c.root}>
        <div className={c.col}>
          <span className={c.title}>Select players</span>
          <div className={c.playersList}>
            {onlinePlayers.map((p) => {
              const isSelected = selectedPlayers.includes(p.steamId);
              return (
                <PlayersListItem
                  key={p.steamId}
                  className={classNames(isSelected && c.selected)}
                  steamId={p.steamId}
                  link={null}
                  onClick={() => {
                    setSelectedPlayers((prev) => {
                      if (isSelected) {
                        return prev.filter((id) => id !== p.steamId);
                      } else {
                        return [...prev, p.steamId];
                      }
                    });
                  }}
                  after={<Switch active={isSelected} setActive={() => {}} />}
                />
              );
            })}
          </div>
        </div>
        <div className={c.col}>
          <span className={c.title}>Balanced teams</span>
          <div className={c.teams}>
            {balancedTeams ? (
              balancedTeams.map((team, index) => {
                const totalElo = team.reduce(
                  (sum, player) => sum + Number(player.elo),
                  0,
                );
                const avgElo = Math.round(totalElo / team.length);

                return (
                  <div key={index} className={c.team}>
                    <span className={c.teamTitle}>Team {index + 1}</span>
                    <div>
                      ELO: {totalElo} total, {avgElo} average
                    </div>
                    {team.map((player) => (
                      <PlayersListItem
                        key={player.steamId}
                        steamId={player.steamId}
                        link={null}
                        after={
                          <span className={c.nowrap}>{player.elo} ELO</span>
                        }
                      />
                    ))}
                  </div>
                );
              })
            ) : (
              <span>Select at least 3 players to balance teams</span>
            )}
          </div>
        </div>
      </div>
    </ActionPage>
  );
};

export default BalancerMenu;
