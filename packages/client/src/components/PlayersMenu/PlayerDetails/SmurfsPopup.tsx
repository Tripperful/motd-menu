import { SteamPlayerData } from '@motd-menu/common';
import React, { FC, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes } from 'react-router-dom';
import {
  usePlayerNames,
  usePlayerSmurfSteamIds,
} from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { LineWithCopy } from '~components/common/LineWithCopy';
import { Popup } from '~components/common/Popup';
import { theme } from '~styles/theme';
import { PlayerDetails } from '.';
import { PlayersListItem } from '../PlayersList/PlayersListItem';

const useStyles = createUseStyles({
  content: {
    gap: '0.2em',
  },
  header: {
    color: theme.fg1,
    fontSize: '1.25em',
    marginBottom: '0.25em',
    '&:not(:first-child)': {
      marginTop: '0.5em',
    },
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    padding: '0 1em',
  },
});

export const SmurfsPopupContent: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const names = usePlayerNames(steamId);
  const steamIds = usePlayerSmurfSteamIds(steamId);

  const relatedSteamIds = useMemo(
    () => steamIds.filter((id) => id !== steamId),
    [steamId, steamIds],
  );

  return (
    <>
      {(names?.length ?? 0) > 0 && (
        <>
          <div className={c.header}>Names ({names.length})</div>
          <div className={c.list}>
            {names.map((name) => (
              <LineWithCopy key={name} copyText={name} what="Nickname">
                {name}
              </LineWithCopy>
            ))}
          </div>
        </>
      )}
      {(relatedSteamIds?.length ?? 0) > 0 && (
        <>
          <div className={c.header}>
            Other related accounts ({relatedSteamIds.length})
          </div>
          <div className={c.list}>
            {relatedSteamIds.map((steamId) => (
              <PlayersListItem key={steamId} steamId={steamId} />
            ))}
          </div>
        </>
      )}
      {!(names?.length ?? 0) && !(relatedSteamIds?.length ?? 0) && (
        <div>No data available</div>
      )}
    </>
  );
};

export const SmurfsPopup: FC<{ profile: SteamPlayerData }> = ({ profile }) => {
  const c = useStyles();
  const goBack = useGoBack();

  return (
    <Popup
      title={`${profile.name}'s accounts details`}
      onClose={goBack}
      contentClassName={c.content}
      poster
    >
      <SmurfsPopupContent steamId={profile.steamId} />
      <Routes>
        <Route path=":steamId/*" element={<PlayerDetails />} />
      </Routes>
    </Popup>
  );
};
