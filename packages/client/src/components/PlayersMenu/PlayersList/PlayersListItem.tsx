import React, { ComponentPropsWithRef, FC } from 'react';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { PlayerItem } from '~components/common/PlayerItem';

type PlayersListItemProps = Omit<
  ComponentPropsWithRef<typeof PlayerItem>,
  'profile'
> & {
  steamId: string;
};

export const PlayersListItem: FC<PlayersListItemProps> = ({
  steamId,
  ...rest
}) => {
  const profile = usePlayerSteamProfile(steamId);

  return (
    <PlayerItem
      profile={profile}
      link={rest.link === undefined ? profile.steamId : rest.link}
      {...rest}
    />
  );
};
