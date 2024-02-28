import React, { FC, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Exit } from '~components/Exit';
import { MainMenu } from '~components/MainMenu';
import { TeamMenu } from '~components/TeamMenu';

const MapList = React.lazy(
  () => import(/* webpackChunkName: "lazy-main" */ '~components/MapList'),
);

const ServerSettings = React.lazy(
  () =>
    import(/* webpackChunkName: "lazy-main" */ '~components/ServerSettings'),
);

const ClientSettings = React.lazy(
  () =>
    import(/* webpackChunkName: "lazy-main" */ '~components/ClientSettings'),
);

const PlayersMenu = React.lazy(
  () => import(/* webpackChunkName: "lazy-main" */ '~components/PlayersMenu'),
);

const MatchMenu = React.lazy(
  () => import(/* webpackChunkName: "lazy-main" */ '~components/MatchMenu'),
);

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" ErrorBoundary={MainMenu}>
          <Route path="" element={<MainMenu />} />
          <Route path="exit" element={<Exit />} />
          <Route
            path="maps/:mapName?/*"
            element={
              <Suspense>
                <MapList />
              </Suspense>
            }
          />
          <Route path="teams/:teamIndex?" element={<TeamMenu />} />
          <Route
            path="serverSettings"
            element={
              <Suspense>
                <ServerSettings />
              </Suspense>
            }
          />
          <Route
            path="clientSettings"
            element={
              <Suspense>
                <ClientSettings />
              </Suspense>
            }
          />
          <Route
            path="players/*"
            element={
              <Suspense>
                <PlayersMenu />
              </Suspense>
            }
          />
          <Route
            path="matches/*"
            element={
              <Suspense>
                <MatchMenu />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
