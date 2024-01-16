import React, { FC, Suspense } from 'react';
import { Menu, MenuItemInfo } from '~components/common/Menu';
import TeamsIcon from '~icons/flag.svg';
import KnobsIcon from '~icons/knobs.svg';
import PlayersIcon from '~icons/people.svg';
import PlayIcon from '~icons/play.svg';
import TerrainIcon from '~icons/terrain.svg';

const menuItems: MenuItemInfo[] = [
  { title: 'Maps', link: 'maps', Icon: TerrainIcon },
  { title: 'Teams', link: 'teams', Icon: TeamsIcon },
  {
    title: 'Players',
    link: 'players',
    Icon: PlayersIcon,
  },
  {
    title: 'Server settings',
    link: 'serverSettings',
    Icon: KnobsIcon,
    permissions: ['cvars_matchmaking_view', 'cvars_admin_view'],
  },
  {
    title: 'Match menu',
    link: 'match',
    Icon: PlayIcon,
    permissions: ['dev'],
  },
];

export const MainMenu: FC = () => (
  <Suspense>
    <Menu items={menuItems} title="Main menu" />
  </Suspense>
);
