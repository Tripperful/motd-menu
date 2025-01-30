import React, { FC, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { useOnlineServers } from 'src/hooks/state/onlineServers';
import { useOnlineServersMaps } from 'src/hooks/state/onlineServersMaps';
import { useOnlineServersPlayers } from 'src/hooks/state/onlineServersPlayers';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useGoBack } from 'src/hooks/useGoBack';
import { PlayerItem } from '~components/common/PlayerItem';
import { Popup } from '~components/common/Popup';
import HudIcon from '~icons/hud.svg';
import { activeItemNoTransform } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    backgroundColor: theme.bg1,
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1em',
    height: '100%',
    position: 'relative',
    overflowY: 'auto',
  },
  otherLinks: {
    position: 'absolute',
    display: 'flex',
    gap: '1em',
    top: '2em',
    right: '2em',
  },
  serverRow: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  link: {
    ...activeItemNoTransform(),
  },
  otherPopup: {
    width: 'calc(100vw - 2em)',
    height: 'calc(100vh - 2em)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
  otherList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    overflowY: 'auto',
  },
  mapItem: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  serverHas: {
    color: theme.fgSuccess,
    display: 'flex',
  },
  serverHasNot: {
    color: theme.fgError,
    display: 'flex',
  },
  mapServersList: {
    display: 'flex',
    gap: '0.5em',
    fontSize: '0.65em',
    flexWrap: 'wrap',
  },
});

const MapListItem: FC<{
  map: string;
  serverNames: string[];
  allServerNames: string[];
}> = ({ map, serverNames, allServerNames }) => {
  const c = useStyles();

  return (
    <div className={c.mapItem}>
      <span>{map}</span>
      <span className={c.mapServersList}>
        {allServerNames.map((serverName) => (
          <span
            key={serverName}
            className={
              serverNames.includes(serverName) ? c.serverHas : c.serverHasNot
            }
          >
            {serverName}
          </span>
        ))}
      </span>
    </div>
  );
};

const AllServersMaps: FC<{ search: string }> = ({ search }) => {
  const c = useStyles();
  const maps = useOnlineServersMaps();

  const allMaps = maps.reduce((acc, { maps }) => {
    maps.forEach((map) => {
      if (!acc.includes(map)) {
        acc.push(map);
      }
    });

    return acc;
  }, [] as string[]);

  const filteredMaps = useMemo(
    () =>
      allMaps.filter((map) => map.toLowerCase().includes(search.toLowerCase())),
    [allMaps, search],
  );

  const allServernames = maps.map(({ serverInfo }) => serverInfo.name);

  return (
    <div className={c.otherList}>
      {filteredMaps.map((map) => (
        <MapListItem
          key={map}
          map={map}
          serverNames={maps
            .filter(({ maps }) => maps.includes(map))
            .map(({ serverInfo }) => serverInfo.name)}
          allServerNames={allServernames}
        />
      ))}
    </div>
  );
};

const MapsPopup: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();

  const [search, setSearch] = useState('');

  return (
    <Popup onClose={goBack} title="Maps" className={c.otherPopup}>
      <input
        type="text"
        placeholder="Search maps..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <AllServersMaps search={search} />
    </Popup>
  );
};

const PlayersPopup: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const serversPlayers = useOnlineServersPlayers();

  return (
    <Popup onClose={goBack} title="Players" className={c.otherPopup}>
      <div className={c.otherList}>
        {serversPlayers.map(({ serverInfo, players }) => (
          <div key={serverInfo.id}>
            {serverInfo.name}
            <div>
              {players?.map((player) => (
                <PlayerItem
                  key={player.steamId}
                  profile={player.steamProfile}
                />
              )) ?? 'No players connected'}
            </div>
          </div>
        ))}
      </div>
    </Popup>
  );
};

export const OnlineServers: FC = () => {
  const c = useStyles();
  const servers = useOnlineServers();
  const sortedServers = useMemo(
    () =>
      servers.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }

        if (a.name > b.name) {
          return 1;
        }

        return 0;
      }),
    [servers],
  );

  const isStreamer = useCheckPermission('streamer');

  return (
    <div className={c.root}>
      <h2>Online servers ({sortedServers.length})</h2>
      {sortedServers.map((serverInfo) => (
        <span className={c.serverRow} key={serverInfo.id}>
          {isStreamer && (
            <Link
              key={serverInfo.id}
              className={c.link}
              to={`../streamerOverlay/?guid=${serverInfo.sessionId}&token=${new URLSearchParams(
                location.search,
              ).get('token')}`}
              target="_blank"
            >
              <HudIcon />
            </Link>
          )}
          <Link
            className={c.link}
            to={`/?guid=${serverInfo.sessionId}&token=${new URLSearchParams(
              location.search,
            ).get('token')}`}
            target="_blank"
          >
            {serverInfo.name} ({serverInfo.ip}:{serverInfo.port}, version:&nbsp;
            {serverInfo.version?.substring(0, 8) ?? 'unknown'})
          </Link>
        </span>
      ))}
      <div className={c.otherLinks}>
        <Link to="players">Players</Link>
        <Link to="maps">Maps</Link>
      </div>
      <Routes>
        <Route path="maps" element={<MapsPopup />} />
        <Route path="players" element={<PlayersPopup />} />
      </Routes>
    </div>
  );
};

export default OnlineServers;
