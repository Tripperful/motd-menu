import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
import {
  usePlayerNames,
  usePlayerSmurfSteamIds,
} from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { steamProfileLink } from 'src/util';
import { LineWithCopy } from '~components/common/LineWithCopy';
import { Popup } from '~components/common/Popup';
import { theme } from '~styles/theme';

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
});

export const SmurfsPopupContent: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const names = usePlayerNames(steamId);
  const smurfSteamIds = usePlayerSmurfSteamIds(steamId);

  return (
    <>
      <div className={c.header}>Names</div>
      {names.map((name) => (
        <LineWithCopy key={name} copyText={name} what="Nickname">
          {name}
        </LineWithCopy>
      ))}
      <div className={c.header}>Related accounts</div>
      {smurfSteamIds.map((steamId) => (
        <LineWithCopy
          key={steamId}
          copyText={steamId}
          what="Steam ID"
          link={{
            url: steamProfileLink(steamId),
            copy: true,
            open: true,
          }}
        >
          {steamId}
        </LineWithCopy>
      ))}
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
    </Popup>
  );
};
