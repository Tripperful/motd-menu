import { SteamPlayerData } from '@motd-menu/common';
import debounce from 'lodash/debounce';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { useGoBack } from 'src/hooks/useGoBack';
import { PlayerItem } from '~components/common/PlayerItem';
import { Popup } from '~components/common/Popup';

const useStyles = createUseStyles({
  root: {
    width: '50vw',
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    padding: '1em',
    overflow: 'hidden auto',
  },
});

export const FindByName: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const [name, setName] = useState('');
  const [profiles, setProfiles] = useState<SteamPlayerData[]>([]);

  const fetchDebounced = useMemo(
    () =>
      debounce(async (name: string) => {
        setProfiles(await motdApi.findPlayersByName(name));
      }, 500),
    [],
  );

  useEffect(() => {
    if (name.length > 2) {
      fetchDebounced(name);

      return fetchDebounced.cancel;
    }
  }, [name, fetchDebounced]);

  return (
    <Popup title={'Find player by name'} onClose={goBack}>
      <div className={c.root}>
        <input
          type="text"
          value={name}
          placeholder="Player's name..."
          onChange={(e) => setName(e.currentTarget.value)}
        />
        {(profiles?.length ?? 0) > 0 && (
          <div className={c.list}>
            {profiles.map((profile) => (
              <PlayerItem
                key={profile.steamId}
                profile={profile}
                link={'../' + profile.steamId}
              />
            ))}
          </div>
        )}
      </div>
    </Popup>
  );
};
