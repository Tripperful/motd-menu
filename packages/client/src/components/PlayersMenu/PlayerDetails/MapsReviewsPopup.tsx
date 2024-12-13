import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes, useParams } from 'react-router-dom';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { MapDetails } from '~components/MapList/MapDetails';
import { theme } from '~styles/theme';
import { PlayerReviews } from './PlayerReviews';

const useStyles = createUseStyles({
  root: {
    width: 'calc(50vw - 2em)',
    height: 'calc(80vh - 2em)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  chip: {
    fontSize: '0.8em',
    padding: '0.2em 0.5em',
    backgroundColor: theme.bg2,
    borderRadius: '0.5em',
    textShadow: '0 0 4px #000b',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    gap: '0.5em',
    overflow: 'hidden scroll',
    paddingRight: '0.5em',
  },
});

const RatedMapDetails: FC = () => {
  const { mapName } = useParams();

  return <MapDetails mapName={mapName} />;
};

const MapsReviewsPopupTitle: FC<{ steamId: string; total: number }> = ({
  steamId,
  total,
}) => {
  const c = useStyles();
  const profile = usePlayerSteamProfile(steamId);

  return (
    <span className={c.header}>
      {`${profile.name}'s maps reviews`}
      {total != null && <span className={c.chip}>{total}</span>}
    </span>
  );
};

export const MapsReviewsPopup: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [total, setTotal] = useState(null as number);

  return (
    <Popup
      title={<MapsReviewsPopupTitle steamId={steamId} total={total} />}
      onClose={goBack}
      className={c.root}
    >
      <PlayerReviews steamId={steamId} />
      <Routes>
        <Route path="/:mapName/*" element={<RatedMapDetails />} />
      </Routes>
    </Popup>
  );
};
