import React, { FC, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { useOnlineServers } from 'src/hooks/state/onlineServers';
import { useOnlineServersMaps } from 'src/hooks/state/onlineServersMaps';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
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
  mapsPopup: {
    width: 'calc(100vw - 2em)',
    height: 'calc(100vh - 2em)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
  mapsList: {
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
    <div className={c.mapsList}>
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
    <Popup onClose={goBack} title="Maps" className={c.mapsPopup}>
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

  return (
    <div className={c.root}>
      <h2>Online servers ({sortedServers.length})</h2>
      {sortedServers.map((serverInfo) => (
        <span className={c.serverRow} key={serverInfo.id}>
          <Link
            className={c.link}
            to={`/?guid=${serverInfo.sessionId}&token=${new URLSearchParams(
              location.search,
            ).get('token')}`}
            target="_blank"
          >
            {serverInfo.name} ({serverInfo.ip}:{serverInfo.port}, version
            hash:&nbsp;
            {serverInfo.versionHash?.substring(0, 8) ?? 'unknown'})
          </Link>
        </span>
      ))}
      <Routes>
        <Route path="maps" element={<MapsPopup />} />
      </Routes>
      <div className={c.otherLinks}>
        <Link to="maps">Maps</Link>
      </div>
    </div>
  );
};

export default OnlineServers;
