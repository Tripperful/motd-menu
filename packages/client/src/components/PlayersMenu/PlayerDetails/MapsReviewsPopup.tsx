import { SteamPlayerData } from '@motd-menu/common';
import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes, useParams } from 'react-router-dom';
import { usePlayerReviews } from 'src/hooks/state/playerReviews';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { MapDetails } from '~components/MapList/MapDetails';
import { MapReview } from '~components/MapList/MapDetails/MapReview';
import { verticalScroll } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
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
    gap: '0.5em',
  },
  list: {
    ...verticalScroll(),
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
});

const RatedMapDetails: FC = () => {
  const { mapName } = useParams();

  return <MapDetails mapName={mapName} />;
};

export const MapsReviewsPopup: FC<{ profile: SteamPlayerData }> = ({
  profile,
}) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [total, setTotal] = useState(null as number);
  const { steamId } = profile;
  const reviews = usePlayerReviews(steamId);

  if (reviews.length === 0) return null;

  return (
    <Popup
      title={
        <span className={c.header}>
          {`${profile.name}'s maps reviews`}
          {total != null && <span className={c.chip}>{total}</span>}
        </span>
      }
      onClose={goBack}
      poster
    >
      {reviews?.map((r) => (
        <MapReview key={r.mapName} review={r} mapDetailsMode />
      ))}
      <Routes>
        <Route path="/:mapName/*" element={<RatedMapDetails />} />
      </Routes>
    </Popup>
  );
};
