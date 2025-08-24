import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { motdApi } from 'src/api';
import {
  useOnlinePlayers,
  usePlayerSteamProfile,
} from 'src/hooks/state/players';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { PlayerDetails } from '~components/PlayersMenu/PlayerDetails';
import { ConfirmDialog } from '~components/common/ConfirmDialog';
import { Page } from '~components/common/Page';
import { PlayerItem } from '~components/common/PlayerItem';
import { activeItem, verticalScroll } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '1em',
    padding: '1em',
    overflow: 'hidden',
    backgroundColor: theme.bg1,
    borderRadius: '0.5em',
    maxHeight: 'calc(100% - 8em)',
  },
  title: {
    fontSize: '1.5em',
  },
  playerList: {
    ...verticalScroll(),
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '0.5em',
    width: '100%',
  },
  playerItem: {
    width: '20em',
  },
  active: {
    ...activeItem(),
  },
});

const VoteSpecConfirm: FC = () => {
  const c = useStyles();
  const { steamId } = useParams();
  const player = usePlayerSteamProfile(steamId);

  const onVote = async (confirm: boolean) => {
    await motdApi.clientExec(confirm ? 'yes' : 'no');
    motdApi.closeMenu();
  };

  return (
    <>
      <ConfirmDialog
        title={
          <span>
            Do you want to move{' '}
            <Link to="playerDetails" className={c.active}>
              {player.name}
            </Link>{' '}
            to spectators?
          </span>
        }
        onConfirm={() => onVote(true)}
        onCancel={() => onVote(false)}
      />
      <Routes>
        <Route path="playerDetails" element={<PlayerDetails />} />
      </Routes>
    </>
  );
};

const VoteSpecList: FC = () => {
  const c = useStyles();
  const players = useOnlinePlayers();
  const mySteamId = useMySteamId();

  const otherPlayers = players.filter(
    (p) => p.steamId !== mySteamId && p.teamIdx !== 1,
  );

  const onPlayerClick = (steamId: string) => {
    const player = players.find((p) => p.steamId === steamId);
    motdApi.clientExec('votespec ' + player.userId);
    motdApi.voteSpecPlayer(player.steamId);
    motdApi.closeMenu();
  };

  const title =
    otherPlayers.length > 0
      ? 'Select a player to move to spectators'
      : 'No players to move to spectators';

  return (
    <Page title={<h2>Move player to spectators</h2>} backPath="/">
      <div className={c.root}>
        <div className={c.title}>{title}</div>
        {otherPlayers.length > 0 && (
          <div className={c.playerList}>
            {otherPlayers.map((p) => (
              <PlayerItem
                className={c.playerItem}
                profile={p.steamProfile}
                key={p.steamId}
                onClick={() => onPlayerClick(p.steamId)}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};

export const VoteSpec: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<VoteSpecList />} />
      <Route path="/:steamId/*" element={<VoteSpecConfirm />} />
    </Routes>
  );
};
