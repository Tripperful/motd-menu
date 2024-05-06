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
    paddingRight: '0.25em',
    marginRight: '-0.75em',
    overflow: 'hidden scroll',
  },
});

type OnPlayerPickedAction =
  | {
      onPlayerPicked: (steamId: string) => void;
    }
  | {
      linkPrefix: string;
    };

export const FindPlayerByNamePopup: FC<OnPlayerPickedAction> = (props) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [name, setName] = useState('');
  const [profiles, setProfiles] = useState<SteamPlayerData[]>(null);

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
        {profiles === null ? null : profiles.length === 0 ? (
          <div>No players found</div>
        ) : (
          <div className={c.list}>
            {profiles.map((profile) =>
              'linkPrefix' in props ? (
                <PlayerItem
                  key={profile.steamId}
                  profile={profile}
                  link={props.linkPrefix + profile.steamId}
                />
              ) : (
                <PlayerItem
                  key={profile.steamId}
                  profile={profile}
                  onClick={() => {
                    props.onPlayerPicked(profile.steamId);
                    goBack();
                  }}
                />
              ),
            )}
          </div>
        )}
      </div>
    </Popup>
  );
};
