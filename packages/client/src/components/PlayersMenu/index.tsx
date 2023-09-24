import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes } from 'react-router-dom';
import { useMount } from 'react-use';
import { resetPlayers } from 'src/hooks/state/players';
import { Page } from '~components/common/Page';
import RefreshIcon from '~icons/refresh.svg';
import { activeItem } from '~styles/elements';
import { PlayerDetails } from './PlayerDetails';
import { PlayersList } from './PlayersList';

const useStyles = createUseStyles({
  button: {
    ...activeItem(),
    display: 'flex',
    padding: '0.5em',
  },
});

export const PlayersMenu: FC = () => {
  const c = useStyles();

  useMount(resetPlayers);

  return (
    <Page
      title="Players"
      headerContent={
        <div className={c.button} onClick={() => resetPlayers()}>
          <RefreshIcon />
        </div>
      }
    >
      <PlayersList />
      <Routes>
        <Route path="/:steamId/*" element={<PlayerDetails />} />
      </Routes>
    </Page>
  );
};
