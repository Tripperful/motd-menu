import React, { useMemo } from 'react';
import { MenuItemInfo } from '~components/common/Menu';
import CancelIcon from '~icons/cancel.svg';
import EyeIcon from '~icons/eye.svg';
import FlagIcon from '~icons/flag.svg';
import SubstituteIcon from '~icons/substitute.svg';
import { useOnlinePlayers } from './state/players';
import { useCvar } from './useCvar';
import { useMySteamId } from './useMySteamId';

export const useAvailableVotes = (): MenuItemInfo[] => {
  const steamId = useMySteamId();
  const players = useOnlinePlayers();
  const myTeamIdx = players.find((p) => p.steamId === steamId)?.teamIdx;
  const isPlaying = myTeamIdx !== 1;
  const [mmMatchValue] = useCvar('mp_match');
  const isMatch = Number(mmMatchValue) > 0;

  const votes = useMemo(() => {
    const votes = [] as MenuItemInfo[];

    if (mmMatchValue != null && isPlaying) {
      if (isMatch) {
        votes.push({
          title: 'Substitute a player',
          link: 'substitute',
          Icon: <SubstituteIcon />,
        });
        votes.push({
          title: 'Cancel this match',
          link: 'cancelMatch',
          Icon: <CancelIcon />,
        });
        votes.push({
          title: 'Forfeit this match',
          link: 'forfeitMatch',
          Icon: <FlagIcon />,
        });
      } else {
        votes.push({
          title: 'Move to spectators',
          link: 'spec',
          Icon: <EyeIcon />,
        });
      }
    }

    return votes;
  }, [isPlaying, isMatch, mmMatchValue]);

  return votes;
};
