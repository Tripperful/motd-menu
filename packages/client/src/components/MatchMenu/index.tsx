import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MatchResultsMenu } from './MatchResultsMenu';

export const MatchMenu: FC = () => {
  return (
    <Routes>
      <Route path="/*" element={<MatchResultsMenu />} />
    </Routes>
  );
};

export default MatchMenu;
