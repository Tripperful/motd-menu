import React, { FC, useEffect, useState } from 'react';
import { motdApi } from 'src/api';

export const PlayerTimePlayed: FC<{ steamId: string }> = ({ steamId }) => {
  const [timePlayed, setTimePlayed] = useState<string>('Loading...');

  useEffect(() => {
    motdApi
      .getTotalTimePlayed(steamId)
      .then((v) => {
        setTimePlayed((v / 3600).toFixed(2) + ' hours');
      })
      .catch(() => {
        setTimePlayed('unknown');
      });
  }, [steamId]);

  return <div>Total time played: {timePlayed}</div>;
};
