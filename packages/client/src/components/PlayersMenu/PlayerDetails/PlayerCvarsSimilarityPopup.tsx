import { SteamPlayerData } from '@motd-menu/common';
import React, { FC } from 'react';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { createUseStyles } from 'react-jss';
import { Routes, Route } from 'react-router-dom';
import { useCvarsSimilarity } from 'src/hooks/state/cvarsSimilarity';
import PlayerDetails from '.';
import { PlayersListItem } from '../PlayersList/PlayersListItem';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5em',
  },
  diff: {
    padding: '0.5em',
  },
});

const PlayerCvarsSimilarity: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const cvarsSimilarity = useCvarsSimilarity(steamId);

  return (
    <>
      <div className={c.root}>
        {cvarsSimilarity.map((entry) => (
          <div>
            <PlayersListItem
              steamId={entry.steam_id}
              key={entry.steam_id}
              after={`${entry.matching_cvars}/${entry.total_cvars} (${entry.match_percentage}%)`}
            />
            <div className={c.diff}>
              <div>Difference:</div>
              <div>
                {entry.unmatched_info.map((cvarInfo) => (
                  <div key={cvarInfo.cvar}>{cvarInfo.cvar}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Routes>
        <Route path=":steamId" element={<PlayerDetails />} />
      </Routes>
    </>
  );
};

export const PlayerCvarsSimilarityPopup: FC<{ profile: SteamPlayerData }> = ({
  profile,
}) => {
  const goBack = useGoBack();

  return (
    <Popup
      title={`10 players with cvars most similar to ${profile.name}`}
      onClose={goBack}
    >
      <PlayerCvarsSimilarity steamId={profile.steamId} />
    </Popup>
  );
};
