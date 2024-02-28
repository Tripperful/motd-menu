import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MatchResultsMenu } from './MatchResultsMenu';
import { StartMatchMenu } from './StartMatchMenu';

export const MatchMenu: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MatchResultsMenu />} />
      <Route path="start/*" element={<StartMatchMenu />} />
    </Routes>
  );
};

export default MatchMenu;
