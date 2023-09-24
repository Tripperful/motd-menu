import React, { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motdApi } from 'src/api';
import { Menu, MenuItemInfo } from '~components/common/Menu';
import CombineIcon from '~icons/combine.svg';
import SpectateIcon from '~icons/eye.svg';
import RebelIcon from '~icons/lambda.svg';
import { theme } from '~styles/theme';

const menuItems: MenuItemInfo[] = [
  {
    title: 'Spectate',
    link: '1',
    Icon: SpectateIcon,
    color: theme.teamColors.spectator,
  },
  {
    title: 'Combile',
    link: '2',
    Icon: CombineIcon,
    color: theme.teamColors.combine,
  },
  {
    title: 'Rebels',
    link: '3',
    Icon: RebelIcon,
    color: theme.teamColors.rebel,
  },
];

export const TeamMenu: FC = () => {
  const { teamIndex } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    if (teamIndex) {
      motdApi.setTeam(Number(teamIndex));
      nav('/exit');
    }
  }, [nav, teamIndex]);

  return <Menu items={menuItems} hint="Select your team" />;
};
