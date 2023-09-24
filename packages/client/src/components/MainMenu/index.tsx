import React, { FC } from 'react';
import { Menu, MenuItemInfo } from '~components/common/Menu';
import TeamsIcon from '~icons/flag.svg';
import KnobsIcon from '~icons/knobs.svg';
import PlayersIcon from '~icons/people.svg';
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
    title: 'Match settings',
    link: 'matchSettings',
    Icon: KnobsIcon,
    permissions: ['cvars_matchmaking_view'],
  },
];

export const MainMenu: FC = () => <Menu items={menuItems} hint="Main menu" />;
