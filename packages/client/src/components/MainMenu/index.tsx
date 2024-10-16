import React, { FC, Suspense } from 'react';
import { getSessionData } from 'src/hooks/useSessionData';
import { Menu, MenuItemInfo } from '~components/common/Menu';
import { Spinner } from '~components/common/Spinner';
import TeamsIcon from '~icons/flag.svg';
import KnobsIcon from '~icons/knobs.svg';
import PlayersIcon from '~icons/players.svg';
import MatchesIcon from '~icons/playlist.svg';
import SettingsIcon from '~icons/settings.svg';
import TerrainIcon from '~icons/terrain.svg';

const menuItems: MenuItemInfo[] = [
  { title: 'Maps', link: 'maps', Icon: <TerrainIcon /> },
  {
    title: 'Teams',
    link: 'teams',
    Icon: <TeamsIcon />,
    shouldShow: () => getSessionData().userId != null,
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
];

export const MainMenu: FC = () => (
  <Suspense fallback={<Spinner />}>
    <Menu items={menuItems} title="Main menu" />
  </Suspense>
);
