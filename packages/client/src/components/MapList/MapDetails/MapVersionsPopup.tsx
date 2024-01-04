import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { setMapDetails, useMapDetails } from 'src/hooks/state/mapDetails';
import { setMapsPreviews, useMapsPreviews } from 'src/hooks/state/mapPreviews';
import { addNotification } from 'src/hooks/state/notifications';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { Switch } from '~components/common/Switch';

const useStyles = createUseStyles({
  root: {
    width: '25em',
    height: '25em',
  },
  mapsList: {
    marginTop: '0.5em',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflow: 'hidden scroll',
  },
  map: {
    padding: '0.5em',
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
});

const MapVersionItem: FC<{ mapName: string; parentMapName: string }> = ({
  mapName,
  parentMapName,
}) => {
  const c = useStyles();
  const { otherVersions } = useMapDetails(parentMapName);

  const [disabled, setDisabled] = useState(false);

  const setActive = async (makeSubVersion: boolean) => {
    try {
      setDisabled(true);

      const parentMap = makeSubVersion ? parentMapName : null;

      await motdApi.setMapParent(mapName, parentMap);

      setMapsPreviews(async (cur) =>
        (await cur).map((p) => {
          if (p.name !== mapName) return p;

          return {
            ...p,
            parentMap,
          };
        }),
      );

      setMapDetails(parentMapName, async (cur) => {
        const details = await cur;

        const otherVersions = details.otherVersions.filter(
          (m) => m !== mapName,
        );

        if (makeSubVersion) {
          otherVersions.push(mapName);
        }

        return {
          ...details,
          otherVersions,
        };
      });

      addNotification(
        'success',
        `${mapName} is ${
          makeSubVersion ? 'now' : 'no longer'
        } a version of ${parentMapName}`,
      );
    } catch {
      addNotification('error', 'Failed to save changes');
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className={c.map}>
      <Switch
        disabled={disabled}
        active={otherVersions.includes(mapName)}
        setActive={setActive}
      />
      {mapName}
    </div>
  );
};

export const MapVersionsPopup: FC<{ mapName: string }> = ({ mapName }) => {
  const c = useStyles();
  const goBack = useGoBack();

  const mapsPreviews = useMapsPreviews();
  const [filter, setFilter] = useState('');

  const filteredMaps = mapsPreviews.filter(
    (p) =>
      p.name !== mapName && p.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Popup title="Other versions" onClose={goBack} className={c.root}>
      <input
        type="text"
        placeholder="Search maps..."
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />
      {filteredMaps.length ? (
        <div className={c.mapsList}>
          {filteredMaps.map(({ name }) => (
            <MapVersionItem key={name} mapName={name} parentMapName={mapName} />
          ))}
        </div>
      ) : (
        <div>No maps found</div>
      )}
    </Popup>
  );
};
