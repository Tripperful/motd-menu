import { PlayerClientSettings } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useFirstMountState } from 'react-use';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import {
  setPlayerSettings,
  usePlayerSettings,
} from 'src/hooks/state/playerSettings';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { LabeledSwitch } from '~components/common/LabeledSwitch';
import { ClassNameProps } from '~types/props';
import { LabeledInput } from './LabeledInput';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  settings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
});

const fovMin = 70;
const fovMax = 110;

export const PlayerSettings: FC<{ steamId: string } & ClassNameProps> = ({
  steamId,
  className,
}) => {
  const c = useStyles();
  const settings = usePlayerSettings(steamId);
  const mySteamId = useMySteamId();
  const disabled = steamId !== mySteamId;

  const [hitSound, setHitSound] = useState(settings.hitSound);
  const [killSound, setKillSound] = useState(settings.killSound);
  const [esp, setEsp] = useState(settings.esp);
  const [drawViewmodel, setDrawViewmodel] = useState(settings.drawViewmodel);

  const [fov, setFov] = useState(settings.fov);
  const [fovStr, setFovStr] = useState(String(fov));

  const onFovBlur = () => {
    if (!fovStr) {
      setFovStr('90');
      setFov(90);
      return;
    }

    if (fovStr !== String(fov)) {
      const clampedFov = Math.min(fovMax, Math.max(fovMin, Number(fovStr)));

      setFov(clampedFov);
      setFovStr(String(clampedFov));
    }
  };

  const firstMount = useFirstMountState();

  useEffect(() => {
    if (firstMount) return;

    const settings: PlayerClientSettings = {
      hitSound,
      killSound,
      esp,
      drawViewmodel,
      fov,
    };

    motdApi
      .setPlayerSettings(settings)
      .then(() => {
        setPlayerSettings(steamId, settings);
      })
      .catch(() => {
        addNotification('error', 'Failed to save settings');
      });
  }, [drawViewmodel, esp, firstMount, fov, hitSound, killSound, steamId]);

  return (
    <div className={classNames(c.root, className)}>
      <div className={c.settings}>
        <LabeledSwitch
          active={hitSound}
          setActive={setHitSound}
          label="Kill sound"
          disabled={disabled}
        />
        <LabeledSwitch
          active={killSound}
          setActive={setKillSound}
          label="Hit sound"
          disabled={disabled}
        />
        <LabeledSwitch
          active={esp}
          setActive={setEsp}
          label="Teammates ESP"
          disabled={disabled}
        />
        <LabeledSwitch
          active={drawViewmodel}
          setActive={setDrawViewmodel}
          label="Draw viewmodel"
          disabled={disabled}
        />
        <LabeledInput
          type="number"
          min={fovMin}
          max={fovMax}
          value={fovStr}
          disabled={disabled}
          onBlur={onFovBlur}
          onChange={(e) => setFovStr(e.currentTarget.value)}
          label={`FOV (${fovMin} - ${fovMax})`}
        />
      </div>
    </div>
  );
};
