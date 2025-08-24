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
    gap: '0.5em',
  },
  map: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  input: {
    flex: '1 1 auto',
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
        (await cur)?.map((p) => {
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
    <Popup
      title={
        <input
          type="text"
          placeholder="Search maps..."
          className={c.input}
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
        />
      }
      onClose={goBack}
      className={c.root}
      contentClassName={c.mapsList}
    >
      {filteredMaps?.length ? (
        <>
          {filteredMaps.map(({ name }) => (
            <MapVersionItem key={name} mapName={name} parentMapName={mapName} />
          ))}
        </>
      ) : (
        <div>No maps found</div>
      )}
    </Popup>
  );
};
