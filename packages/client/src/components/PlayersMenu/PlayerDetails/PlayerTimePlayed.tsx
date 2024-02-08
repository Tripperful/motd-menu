import React, { FC, useEffect, useState } from 'react';
import { motdApi } from 'src/api';
import { playTimeFormat } from 'src/util';

export const PlayerTimePlayed: FC<{ steamId: string }> = ({ steamId }) => {
  const [timePlayed, setTimePlayed] = useState<string>('Loading...');

  useEffect(() => {
    motdApi
      .getTotalTimePlayed(steamId)
      .then((v) => {
        setTimePlayed(playTimeFormat(v));
      })
      .catch(() => {
        setTimePlayed('unknown');
      });
  }, [steamId]);

  return <div>Total time played: {timePlayed}</div>;
};
