import React, { FC, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { motdApi } from 'src/api';
import { useAvailableTeams } from 'src/hooks/useAvailableTeams';
import { Menu } from '~components/common/Menu';

const JoinTeam: FC<{ teamIndex: number }> = ({ teamIndex }) => {
  const nav = useNavigate();

  useEffect(() => {
    if (teamIndex) {
      motdApi.setTeam(Number(teamIndex));
      nav('/exit');
    }
  }, [nav, teamIndex]);

  return null;
};

export const TeamMenu: FC = () => {
  const availableTeams = useAvailableTeams();

  return (
    <>
      <Routes>
        <Route
          path="/*"
          element={
            <Menu
              items={availableTeams.map((t) => ({
                title: t.name,
                link: t.joinIndex.toString(),
                Icon: t.icon,
                color: t.color,
              }))}
              title="Select your team"
            />
          }
        />
        {availableTeams.map((t) => (
          <Route
            key={t.joinIndex}
            path={t.joinIndex.toString()}
            element={<JoinTeam teamIndex={t.joinIndex} />}
          />
        ))}
      </Routes>
    </>
  );
};
