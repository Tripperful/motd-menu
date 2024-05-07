import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { useOnlineServers } from 'src/hooks/state/onlineServers';
import { activeItem } from '~styles/elements';
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
  },
  link: {
    ...activeItem(),
  },
});

export const OnlineServers: FC = () => {
  const c = useStyles();
  const servers = useOnlineServers();

  return (
    <div className={c.root}>
      <h2>Online servers ({servers.length})</h2>
      {servers.map(({ serverInfo, sessionId }) => (
        <Link
          key={serverInfo.id}
          className={c.link}
          to={`/?guid=${sessionId}&token=${new URLSearchParams(
            location.search,
          ).get('token')}`}
          target="_blank"
        >
          {serverInfo.name} ({serverInfo.ip}:{serverInfo.port})
        </Link>
      ))}
    </div>
  );
};

export default OnlineServers;
