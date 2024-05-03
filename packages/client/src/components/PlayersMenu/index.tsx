import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { resetOnlinePlayers } from 'src/hooks/state/players';
import { Page } from '~components/common/Page';
import AddPersonIcon from '~icons/person-add.svg';
import RefreshIcon from '~icons/refresh.svg';
import SearchIcon from '~icons/search.svg';
import { activeItem } from '~styles/elements';
import { FindByName } from './FindByName';
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

  return (
    <Page
      title="Players"
      headerContent={
        <>
          <Link className={c.button} to="byName">
            <SearchIcon />
          </Link>
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
        <Route path="/byName/*" element={<FindByName />} />
        <Route path="/bySteamId/*" element={<ViewBySteamId />} />
        <Route path="/:steamId/*" element={<PlayerDetails />} />
      </Routes>
    </Page>
  );
};

export default PlayersMenu;
