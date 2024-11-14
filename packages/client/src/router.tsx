import React, { FC, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ReplaceConfirm } from '~components/common/ReplaceConfirm';
import { Exit } from '~components/Exit';
import { MainMenu } from '~components/MainMenu';
import { TeamMenu } from '~components/TeamMenu';
import { Vote } from '~components/Vote';

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

const OnlineServers = React.lazy(
  () =>
    import(
      /* webpackChunkName: "online-servers" */ '~components/OnlineServers'
    ),
);

const StreamerOverlay = React.lazy(
  () =>
    import(
      /* webpackChunkName: "streamer-overlay" */ '~components/StreamerOverlay'
    ),
);

const StartVote = React.lazy(
  () => import(/* webpackChunkName: "lazy-main" */ '~components/StartVoteMenu'),
);

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="exit" element={<Exit />} />
        <Route
          path="maps/:mapName?/*"
          element={
            <Suspense>
              <MapList />
            </Suspense>
          }
        />
        <Route path="teams/*" element={<TeamMenu />} />
        <Route
          path="serverSettings/*"
          element={
            <Suspense>
              <ServerSettings />
            </Suspense>
          }
        />
        <Route
          path="clientSettings/*"
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
        <Route
          path="onlineServers/*"
          element={
            <Suspense>
              <OnlineServers />
            </Suspense>
          }
        />
        <Route
          path="streamerOverlay/:sessionId"
          element={
            <Suspense>
              <StreamerOverlay />
            </Suspense>
          }
        />
        <Route
          path="vote/*"
          element={
            <Suspense>
              <Vote />
            </Suspense>
          }
        />
        <Route
          path="startVote/*"
          element={
            <Suspense>
              <StartVote />
            </Suspense>
          }
        />
        <Route
          path="replaceConfirm/:initiatorSteamId/:whomSteamId"
          element={
            <Suspense>
              <ReplaceConfirm />
            </Suspense>
          }
        />
        <Route path="*" element={<MainMenu />} />
      </Routes>
    </BrowserRouter>
  );
};
