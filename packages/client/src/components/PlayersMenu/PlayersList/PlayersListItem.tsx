import React, { FC } from 'react';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { PlayerItem } from '~components/common/PlayerItem';

export const PlayersListItem: FC<{ steamId: string }> = ({ steamId }) => {
  const profile = usePlayerSteamProfile(steamId);

  return <PlayerItem profile={profile} link={profile.steamId} />;
};
