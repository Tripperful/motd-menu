import React, { FC, Suspense, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes, useParams } from 'react-router-dom';
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
import { Spinner } from '~components/common/Spinner';

const useStyles = createUseStyles({
  root: {
    width: '50vw',
    height: '50vh',
    overflow: 'hidden auto',
    display: 'flex',
    flexDirection: 'column',
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
      <div className={c.header}>Names ({names.length})</div>
      <div className={c.list}>
        {names?.map((name) => (
          <LineWithCopy key={name} copyText={name} what="Nickname">
            {name}
          </LineWithCopy>
        ))}
      </div>
      {(relatedSteamIds?.length ?? 0) > 0 && (
        <>
          <div className={c.header}>
            Other related accounts ({relatedSteamIds.length})
          </div>
          <div className={c.list}>
            {relatedSteamIds?.map((steamId) => (
              <PlayersListItem key={steamId} steamId={steamId} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export const SmurfsPopup: FC = () => {
  const c = useStyles();
  const { steamId } = useParams();
  const goBack = useGoBack();

  return (
    <Popup title="Player accounts details" onClose={goBack}>
      <div className={c.root}>
        <Suspense fallback={<Spinner />}>
          <SmurfsPopupContent steamId={steamId} />
        </Suspense>
      </div>
      <Routes>
        <Route path=":steamId" element={<PlayerDetails />} />
      </Routes>
    </Popup>
  );
};
