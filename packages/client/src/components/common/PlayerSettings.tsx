import { PlayerClientSettings } from '@motd-menu/common';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
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
  row: {
    display: 'flex',
    gap: '0.5em',
    height: '2em',
  },
});

const fovMin = 70;
const fovMax = 110;

const zoomFovMin = 15;
const zoomFovMax = 70;

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
  const [kevlarSound, setKevlarSound] = useState(settings.kevlarSound);
  const [esp, setEsp] = useState(settings.esp);
  const [dsp, setDsp] = useState(settings.dsp);
  const [drawViewmodel, setDrawViewmodel] = useState(settings.drawViewmodel);

  const [fov, setFov] = useState(settings.fov);
  const [fovStr, setFovStr] = useState(String(fov));

  const [magZoomEnabled, setMagZoomEnabled] = useState(
    settings.magnumZoomFov !== 0,
  );
  const [magnumZoomFov, setMagnumZoomFov] = useState(settings.magnumZoomFov);
  const [magZFovStr, setMagZFovStr] = useState(String(magnumZoomFov));

  const [crossbowZoomEnabled, setCrossbowZoomEnabled] = useState(
    settings.crossbowZoomFov !== 0,
  );
  const [crossbowZoomFov, setCrossbowZoomFov] = useState(
    settings.crossbowZoomFov,
  );
  const [xbowZFovStr, setXbowZFovStr] = useState(String(crossbowZoomFov));

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

  const onMagZFovBlur = () => {
    if (!magZFovStr) {
      setMagZFovStr('20');
      setMagnumZoomFov(20);
      return;
    }

    if (magZFovStr !== String(magnumZoomFov)) {
      const clampedFov = Math.min(
        zoomFovMax,
        Math.max(zoomFovMin, Number(magZFovStr)),
      );

      setMagnumZoomFov(clampedFov);
      setMagZFovStr(String(clampedFov));
    }
  };

  const onXbowZFovBlur = () => {
    if (!magZFovStr) {
      setXbowZFovStr('20');
      setCrossbowZoomFov(20);
      return;
    }

    if (xbowZFovStr !== String(crossbowZoomFov)) {
      const clampedFov = Math.min(
        zoomFovMax,
        Math.max(zoomFovMin, Number(xbowZFovStr)),
      );

      setCrossbowZoomFov(clampedFov);
      setXbowZFovStr(String(clampedFov));
    }
  };

  useEffect(() => {
    if (disabled) return;

    const newSettings: PlayerClientSettings = {
      hitSound,
      killSound,
      kevlarSound,
      esp,
      dsp,
      drawViewmodel,
      fov,
      magnumZoomFov: magZoomEnabled ? magnumZoomFov : 0,
      crossbowZoomFov,
    };

    if (isEqual(settings, newSettings)) return;

    motdApi
      .setPlayerSettings(newSettings)
      .then(() => {
        setPlayerSettings(steamId, newSettings);
      })
      .catch(() => {
        addNotification('error', 'Failed to save settings');
      });
  }, [
    disabled,
    drawViewmodel,
    esp,
    dsp,
    fov,
    magZoomEnabled,
    magnumZoomFov,
    crossbowZoomFov,
    hitSound,
    killSound,
    kevlarSound,
    steamId,
    settings,
  ]);

  return (
    <div className={classNames(c.root, className)}>
      <div className={c.settings}>
        <LabeledSwitch
          active={killSound}
          setActive={setKillSound}
          label="Kill sound"
          disabled={disabled}
        />
        <LabeledSwitch
          active={hitSound}
          setActive={setHitSound}
          label="Hit sound"
          disabled={disabled}
        />
        <LabeledSwitch
          active={kevlarSound}
          setActive={setKevlarSound}
          label="Kevlar sound"
          disabled={disabled}
        />
        <LabeledSwitch
          active={esp}
          setActive={setEsp}
          label="Teammates ESP"
          disabled={disabled}
        />
        <LabeledSwitch
          active={dsp}
          setActive={setDsp}
          label="Ringing sound from explosions"
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
        <div className={c.row}>
          <LabeledSwitch
            active={crossbowZoomEnabled}
            setActive={(v) => {
              setCrossbowZoomEnabled(v);
              setCrossbowZoomFov(v ? 20 : 0);
              setXbowZFovStr(v ? '20' : '0');
            }}
            label="Crossbow zoom"
            disabled={disabled}
          />
          {crossbowZoomEnabled && (
            <LabeledInput
              type="number"
              min={zoomFovMin}
              max={zoomFovMax}
              value={xbowZFovStr}
              disabled={disabled || !crossbowZoomEnabled}
              onBlur={onXbowZFovBlur}
              onChange={(e) => setXbowZFovStr(e.currentTarget.value)}
              label={`FOV (${zoomFovMin} - ${zoomFovMax})`}
            />
          )}
        </div>
        <div className={c.row}>
          <LabeledSwitch
            active={magZoomEnabled}
            setActive={(v) => {
              setMagZoomEnabled(v);
              setMagnumZoomFov(v ? 20 : 0);
              setMagZFovStr(v ? '20' : '0');
            }}
            label="Magnum zoom"
            disabled={disabled}
          />
          {magZoomEnabled && (
            <LabeledInput
              type="number"
              min={zoomFovMin}
              max={zoomFovMax}
              value={magZFovStr}
              disabled={disabled || !magZoomEnabled}
              onBlur={onMagZFovBlur}
              onChange={(e) => setMagZFovStr(e.currentTarget.value)}
              label={`FOV (${zoomFovMin} - ${zoomFovMax})`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
