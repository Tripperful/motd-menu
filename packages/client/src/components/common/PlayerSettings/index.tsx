import { ClientSettingMetadata } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, useCallback, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import {
  setPlayerSettingsValues,
  usePlayerSettingsMetadata,
  usePlayerSettingsValues,
} from 'src/hooks/state/playerSettings';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { getSessionData } from 'src/hooks/useSessionData';
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';
import { PlayerSettingControl } from './PlayerSettingControl';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    overflow: 'hidden scroll',
    containerType: 'inline-size',
  },
  settings: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '1em',
    alignItems: 'flex-start',

    '@container(max-width: 90vw)': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1em',
    borderRadius: '1em',
    gap: '0.5em',
    backgroundColor: theme.bg1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: '1.2em',
    marginBottom: '0.5em',
  },
});

// TODO: Remove this wrapper when the code is stable
export const PlayerSettings: FC<{ steamId: string } & ClassNameProps> = (
  props,
) => {
  const { srcdsVersion } = getSessionData();

  if (srcdsVersion && srcdsVersion < 92) {
    return 'Please update your srcds to use this feature';
  }

  return <PlayerSettingsImpl {...props} />;
};

const PlayerSettingsImpl: FC<{ steamId: string } & ClassNameProps> = ({
  steamId,
  className,
}) => {
  const { srcdsVersion } = getSessionData();

  if (srcdsVersion && srcdsVersion < 92) {
    return 'Please update your srcds to use this feature';
  }

  const c = useStyles();
  const metadata = usePlayerSettingsMetadata();
  const settingsValues = usePlayerSettingsValues(steamId);
  const mySteamId = useMySteamId();
  const disabled = steamId !== mySteamId;

  const sortedSections = useMemo(() => {
    const settingsBySection = Object.entries(metadata).reduce(
      (acc, [key, value]) => {
        const section = value.section;
        acc[section] ??= {};
        acc[section][key] = value;
        return acc;
      },
      {} as Record<string, Record<string, ClientSettingMetadata>>,
    );

    return Object.entries(settingsBySection)
      .sort(([, a], [, b]) => {
        return Object.values(a)[0].sortOrder - Object.values(b)[0].sortOrder;
      })
      .map(([section, settings]) => {
        return {
          section,
          settings: Object.entries(settings).sort(
            ([, a], [, b]) => a.sortOrder - b.sortOrder,
          ),
        };
      });
  }, [metadata]);

  const setValue = useCallback(
    async (key: string, value: any) => {
      setPlayerSettingsValues(steamId, async (cur) => {
        const curVal = await cur;

        return {
          ...(curVal ?? {}),
          [key]: value,
        };
      });

      motdApi
        .setPlayerSettings({ [key]: value })
        .then(() => {
          addNotification('success', `Setting "${metadata[key].name}" updated`);
        })
        .catch(() => {
          addNotification(
            'error',
            `Failed to save setting "${metadata[key].name}"`,
          );
        });
    },
    [steamId],
  );

  return (
    <div className={classNames(c.root, className)}>
      <div className={c.settings}>
        {sortedSections.map(({ section, settings }) => (
          <div key={section} className={c.section}>
            <div className={c.sectionTitle}>{section}</div>
            {settings.map(([key, setting]) => (
              <PlayerSettingControl
                key={key}
                disabled={disabled}
                metadata={setting}
                value={settingsValues[key]}
                setValue={(value) => setValue(key, value)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
