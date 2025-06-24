import React, { FC, Suspense, useMemo, useState } from 'react';
import { useSessionData } from 'src/hooks/useSessionData';
import { Menu, MenuItemInfo } from '~components/common/Menu';
import TeamsIcon from '~icons/flag.svg';
import KnobsIcon from '~icons/knobs.svg';
import PlayersIcon from '~icons/players.svg';
import MatchesIcon from '~icons/playlist.svg';
import SettingsIcon from '~icons/settings.svg';
import TerrainIcon from '~icons/terrain.svg';
import { AvailableVotesFetcher } from './AvailableVotesFetcher';
import { MainMenuContext } from './MainMenuContext';

export const MainMenu: FC = () => {
  const userId = useSessionData().userId;

  const [availableVotes, setAvailableVotes] = useState<MenuItemInfo[]>([]);

  const contextValue = useMemo(
    () => ({ availableVotes, setAvailableVotes }),
    [availableVotes, setAvailableVotes],
  );

  return (
    <Suspense>
      <MainMenuContext.Provider value={contextValue}>
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
            ] as MenuItemInfo[]
          }
          title="Main menu"
        />
        <AvailableVotesFetcher />
      </MainMenuContext.Provider>
    </Suspense>
  );
};
