import React, { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motdApi } from 'src/api';
import { useAvailableTeams } from 'src/hooks/useAvailableTeams';
import { Menu } from '~components/common/Menu';

export const TeamMenu: FC = () => {
  const { teamIndex } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    if (teamIndex) {
      motdApi.setTeam(Number(teamIndex));
      nav('/exit');
    }
  }, [nav, teamIndex]);

  const availableTeams = useAvailableTeams();

  return (
    <Menu
      items={availableTeams.map((t) => ({
        title: t.name,
        link: t.index.toString(),
        Icon: t.icon,
        color: t.color,
      }))}
      title="Select your team"
    />
  );
};
