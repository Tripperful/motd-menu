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
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';
import { Tabs } from '../Tabs';
import { PlayerSettingControl } from './PlayerSettingControl';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  settings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1em',
    borderRadius: '1em',
    gap: '1em',
    backgroundColor: theme.bg1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: '1.2em',
    marginBottom: '0.5em',
  },
});

export const PlayerSettings: FC<{ steamId: string } & ClassNameProps> = ({
  steamId,
  className,
}) => {
  const c = useStyles();
  const metadata = usePlayerSettingsMetadata();
  const settingsValues = usePlayerSettingsValues(steamId);
  const mySteamId = useMySteamId();
  const disabled = steamId !== mySteamId;

  const sortedTabs = useMemo(() => {
    const tabs: Record<
      string,
      Record<string, Record<string, ClientSettingMetadata>>
    > = {};

    const sortedSettings = Object.entries(metadata).sort(
      ([, a], [, b]) => a.sortOrder - b.sortOrder,
    );

    for (const [settingName, setting] of sortedSettings) {
      const { tab, section } = setting;
      tabs[tab] ??= {};
      tabs[tab][section] ??= {};
      tabs[tab][section][settingName] = setting;
    }

    return tabs;
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

      motdApi.setPlayerSettings({ [key]: value }).catch(() => {
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
      <Tabs
        tabs={Object.entries(sortedTabs).map(([tab, sections]) => ({
          label: tab,
          content: (
            <div className={c.settings}>
              {Object.entries(sections).map(([section, settings]) => (
                <div key={section} className={c.section}>
                  <div className={c.sectionTitle}>{section}</div>
                  {Object.entries(settings).map(([key, setting]) => (
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
          ),
        }))}
      />
    </div>
  );
};
