import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAvailableVotes } from 'src/hooks/useAvailableVotes';
import { Menu } from '~components/common/Menu';
import { CancelMatch } from './CancelMatch';
import { ForfeitMatch } from './ForfeitMatch';
import { SubstitutePlayer } from './SubstitutePlayer';

const StartVoteMenu: FC = () => {
  const votes = useAvailableVotes();

  return (
    <>
      <Routes>
        <Route
          path="/*"
          element={<Menu items={votes} title="Select vote type" />}
        />
        <Route path="substitute" element={<SubstitutePlayer />} />
        <Route path="cancelMatch" element={<CancelMatch />} />
        <Route path="forfeitMatch" element={<ForfeitMatch />} />
      </Routes>
    </>
  );
};

export default StartVoteMenu;
