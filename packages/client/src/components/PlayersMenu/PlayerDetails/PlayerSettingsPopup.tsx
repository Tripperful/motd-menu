import { SteamPlayerData } from '@motd-menu/common';
import React, { FC } from 'react';
import { useGoBack } from 'src/hooks/useGoBack';
import { PlayerSettings } from '~components/common/PlayerSettings';
import { Popup } from '~components/common/Popup';

export const PlayerSettingsPopup: FC<{ profile: SteamPlayerData }> = ({
  profile,
}) => {
  const goBack = useGoBack();

  return (
    <Popup title={`${profile.name}'s settings`} onClose={goBack} fullScreen>
      <PlayerSettings steamId={profile.steamId} />
    </Popup>
  );
};
