import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { useMount } from 'react-use';
import { resetOnlinePlayers } from 'src/hooks/state/players';
import { Page } from '~components/common/Page';
import RefreshIcon from '~icons/refresh.svg';
import AddPersonIcon from '~icons/person-add.svg';
import { activeItem } from '~styles/elements';
import { PlayerDetails } from './PlayerDetails';
import { PlayersList } from './PlayersList';
import { ViewBySteamId } from './ViewBySteamId';

const useStyles = createUseStyles({
  button: {
    ...activeItem(),
    display: 'flex',
    '&:last-child': {
      marginRight: '0.5em',
    },
  },
});

export const PlayersMenu: FC = () => {
  const c = useStyles();

  useMount(resetOnlinePlayers);

  return (
    <Page
      title="Players"
      headerContent={
        <>
          <Link className={c.button} to="bySteamId">
            <AddPersonIcon />
          </Link>
          <div className={c.button} onClick={() => resetOnlinePlayers()}>
            <RefreshIcon />
          </div>
        </>
      }
    >
      <PlayersList />
      <Routes>
        <Route path="/bySteamId/*" element={<ViewBySteamId />} />
        <Route path="/:steamId/*" element={<PlayerDetails />} />
      </Routes>
    </Page>
  );
};
