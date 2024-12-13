import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { playTimeFormat } from 'src/util';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  value: {
    color: theme.fg1,
  },
});

export const PlayerTimePlayed: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
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

  return (
    <div>
      Total time played: <span className={c.value}>{timePlayed}</span>
    </div>
  );
};
