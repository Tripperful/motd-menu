import React, { FC, Suspense } from 'react';
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
  const smurfSteamIds = usePlayerSmurfSteamIds(steamId);

  return (
    <>
      <div className={c.header}>Names</div>
      <div className={c.list}>
        {names?.map((name) => (
          <LineWithCopy key={name} copyText={name} what="Nickname">
            {name}
          </LineWithCopy>
        ))}
      </div>
      <div className={c.header}>Related accounts</div>
      <div className={c.list}>
        {smurfSteamIds?.map((steamId) => (
          <PlayersListItem key={steamId} steamId={steamId} />
        ))}
      </div>
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
        <Suspense>
          <SmurfsPopupContent steamId={steamId} />
        </Suspense>
      </div>
      <Routes>
        <Route path=":steamId" element={<PlayerDetails />} />
      </Routes>
    </Popup>
  );
};
