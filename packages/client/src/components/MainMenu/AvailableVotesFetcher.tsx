import React, { FC, Suspense, useEffect } from 'react';
import { useAvailableVotes } from 'src/hooks/useAvailableVotes';
import { useMainMenuContext } from './MainMenuContext';

const AvailableVotesFetcherSuspended: FC = () => {
  const votes = useAvailableVotes();
  const { setAvailableVotes } = useMainMenuContext();

  useEffect(() => {
    setAvailableVotes(votes);
  }, [votes]);

  return null;
};

export const AvailableVotesFetcher: FC = () => {
  return (
    <Suspense>
      <AvailableVotesFetcherSuspended />
    </Suspense>
  );
};
