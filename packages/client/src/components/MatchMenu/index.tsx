import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MatchResultsMenu } from './MatchResultsMenu';
import { StartMatchMenu } from './StartMatchMenu';

export const MatchMenu: FC = () => {
  return (
    <Routes>
      <Route path="start/*" element={<StartMatchMenu />} />
      <Route path="/*" element={<MatchResultsMenu />} />
    </Routes>
  );
};

export default MatchMenu;
