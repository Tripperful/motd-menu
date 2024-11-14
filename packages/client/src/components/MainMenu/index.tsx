import React, { FC, Suspense } from 'react';
import { useCvar } from 'src/hooks/useCvar';
import { useSessionData } from 'src/hooks/useSessionData';
import { Menu, MenuItemInfo } from '~components/common/Menu';
import { Spinner } from '~components/common/Spinner';
import TeamsIcon from '~icons/flag.svg';
import KnobsIcon from '~icons/knobs.svg';
import PlayersIcon from '~icons/players.svg';
import MatchesIcon from '~icons/playlist.svg';
import SettingsIcon from '~icons/settings.svg';
import TerrainIcon from '~icons/terrain.svg';
import VoteIcon from '~icons/vote.svg';

export const MainMenu: FC = () => {
  const [mmMatchValue] = useCvar('mp_match');
  const isMatch = Number(mmMatchValue) > 0;
  const userId = useSessionData().userId;

  return (
    <Suspense fallback={<Spinner />}>
      <Menu
        items={
          [
            { title: 'Maps', link: 'maps', Icon: <TerrainIcon /> },
            {
              title: 'Teams',
              link: 'teams',
              Icon: <TeamsIcon />,
              shouldShow: () => userId != null,
            },
            {
              title: 'Players',
              link: 'players',
              Icon: <PlayersIcon />,
            },
            {
              title: 'Client settings',
              link: 'clientSettings',
              Icon: <SettingsIcon />,
            },
            {
              title: 'Server settings',
              link: 'serverSettings',
              Icon: <KnobsIcon />,
              permissions: ['cvars_matchmaking_view', 'cvars_admin_view'],
            },
            {
              title: 'Matches',
              link: 'matches',
              Icon: <MatchesIcon />,
            },
            {
              title: 'Start a vote',
              link: 'startVote',
              Icon: <VoteIcon />,
              shouldShow: () => isMatch,
            },
          ] as MenuItemInfo[]
        }
        title="Main menu"
      />
    </Suspense>
  );
};
