import React, { FC } from 'react';

export const EfpsStatsTab: FC<{ matchId: string }> = ({ matchId }) => {
  return (
    <iframe src={`https://hl2dm.everythingfps.com/match.php?sfid=${matchId}`} />
  );
};
