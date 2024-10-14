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
import { Page } from '~components/common/Page';
import { PlayerItem } from '~components/common/PlayerItem';
import { SidePanel } from '~components/common/SidePanel';
import { activeItem, outlineButton } from '~styles/elements';
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
  },
  title: {
    fontSize: '1.5em',
  },
  playerList: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '0.5em',
    overflow: 'hidden scroll',
    paddingRight: '0.5em',
    paddingLeft: '1em',
  },
  playerItem: {
    width: '20em',
  },
  options: {
    display: 'flex',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    gap: '1em',
    alignItems: 'center',
    fontSize: '1.5em',
  },
  option: {
    ...outlineButton(),
    padding: '0.25em 1.5em',
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
    <div className={c.root}>
      <div className={c.title}>
        Do you want to move{' '}
        <Link to="playerDetails" className={c.active}>
          {player.name}
        </Link>{' '}
        to spectators?
      </div>
      <div className={c.options}>
        <div className={c.option} onClick={() => onVote(true)}>
          Yes
        </div>
        <div className={c.option} onClick={() => onVote(false)}>
          No
        </div>
      </div>
      <Routes>
        <Route
          path="playerDetails"
          element={
            <SidePanel title={<h2>Player details</h2>}>
              <PlayerDetails />
            </SidePanel>
          }
        />
      </Routes>
    </div>
  );
};

const VoteSpec: FC = () => {
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
      </div>
    </Page>
  );
};

export const Vote: FC = () => {
  return (
    <Routes>
      <Route path="spec" element={<VoteSpec />} />
      <Route path="spec/:steamId/*" element={<VoteSpecConfirm />} />
    </Routes>
  );
};
