import React from 'react';
import { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes } from 'react-router-dom';
import { motdApi } from 'src/api';
import { useOnlinePlayers } from 'src/hooks/state/players';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { Page } from '~components/common/Page';
import { PlayerItem } from '~components/common/PlayerItem';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '1em',
    padding: '1em',
    overflow: 'hidden',
  },
  playerList: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '0.5em',
    overflow: 'scroll',
    paddingRight: '0.5em',
    paddingLeft: '1em',
  },
  playerListItem: {
    width: '20em',
  },
});

const VoteSpec: FC = () => {
  const c = useStyles();
  const players = useOnlinePlayers();
  const mySteamId = useMySteamId();

  const otherPlayers = players.filter((p) => p.steamId !== mySteamId);
  const onPlayerClick = (steamId: string) => {
    const player = players.find((p) => p.steamId === steamId);
    motdApi.clientExec('votespec ' + player.userId);
    motdApi.closeMenu();
  };

  return (
    <Page title="Move player to spectators">
      <div className={c.root}>
        <div>Select a player to move to spectators</div>
        <div className={c.playerList}>
          {otherPlayers.map((p) => (
            <PlayerItem
              profile={p.steamProfile}
              className={c.playerListItem}
              key={p.steamId}
              onClick={() => onPlayerClick(p.steamId)}
            />
          ))}
        </div>
      </div>
    </Page>
  );
};

export const Vote: FC = () => {
  return (
    <Routes>
      <Route path="spec" element={<VoteSpec />} />
    </Routes>
  );
};
