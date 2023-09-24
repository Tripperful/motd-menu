import React, { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Exit } from '~components/Exit';
import { MainMenu } from '~components/MainMenu';
import { MatchSettings } from '~components/MatchSettings';
import { PlayersMenu } from '~components/PlayersMenu';
import { TeamMenu } from '~components/TeamMenu';
import { MapList } from './components/MapList';

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" ErrorBoundary={MainMenu}>
          <Route path="" element={<MainMenu />} />
          <Route path="exit" element={<Exit />} />
          <Route path="maps/:mapName?/*" element={<MapList />} />
          <Route path="teams/:teamIndex?" element={<TeamMenu />} />
          <Route path="matchSettings" element={<MatchSettings />} />
          <Route path="players/*" element={<PlayersMenu />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
