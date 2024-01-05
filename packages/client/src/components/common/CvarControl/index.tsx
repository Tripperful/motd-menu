import { Cvar, cvarDisplayNames } from '@motd-menu/common';
import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useCvar } from 'src/hooks/useCvar';
import { Switch } from '../Switch';
import { cvarControlOptionsMap } from './cvarControlMap';

export interface CvarControlProps {
  cvar: Cvar;
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
}

const useStyles = createUseStyles({
  cvarControl: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
});

interface SwitchControlProps {}

export const CvarSwitchControl: FC<CvarControlProps & SwitchControlProps> = ({
  cvar,
  value,
  setValue,
  disabled,
}) => {
  const c = useStyles();

  const label = cvarDisplayNames[cvar];

  return (
    <div className={c.cvarControl}>
      <Switch
        active={value && value != '0'}
        setActive={(active) => setValue(active ? '1' : '0')}
        disabled={disabled}
      />
      <div>{label}</div>
    </div>
  );
};

interface NumberControlProps {
  min?: number;
  max?: number;
}

export const CvarNumberControl: FC<CvarControlProps & NumberControlProps> = ({
  cvar,
  value,
  setValue,
  disabled,
  min = -Infinity,
  max = Infinity,
}) => {
  const c = useStyles();

  const label = cvarDisplayNames[cvar];

  const [curValue, setCurValue] = useState('');

  useEffect(() => {
    setCurValue(value);
  }, [value]);

  const onBlur = () => {
    if (curValue !== value) {
      const clampedValue = String(
        Math.min(max, Math.max(min, Number(curValue))),
      );

      setValue(clampedValue);
      setCurValue(clampedValue);
    }
  };

  return (
    <div className={c.cvarControl}>
      <input
        type="number"
        min={min}
        max={max}
        value={curValue ?? ''}
        onBlur={onBlur}
        onChange={(e) => setCurValue(e.currentTarget.value)}
        disabled={disabled}
      />
      <div>{label}</div>
    </div>
  );
};

interface TextControlProps {
  maxLength?: number;
}

export const CvarTextControl: FC<CvarControlProps & TextControlProps> = ({
  cvar,
  value,
  setValue,
  disabled,
  maxLength = 100,
}) => {
  const c = useStyles();

  const [curValue, setCurValue] = useState('');

  useEffect(() => {
    setCurValue(value);
  }, [value]);

  const onBlur = () => {
    if (curValue !== value) {
      const clampedValue = curValue.substring(0, maxLength);

      setValue(clampedValue);
      setCurValue(clampedValue);
    }
  };

  const label = cvarDisplayNames[cvar];

  return (
    <div className={c.cvarControl}>
      <input
        type="text"
        value={curValue ?? ''}
        onBlur={onBlur}
        onChange={(e) => setCurValue(e.currentTarget.value)}
        disabled={disabled}
      />
      <div>{label}</div>
    </div>
  );
};

export type CvarControlSettings =
  | ({ type: 'switch' } & SwitchControlProps)
  | ({ type: 'number' } & NumberControlProps)
  | ({ type: 'text' } & TextControlProps);

export type CvarControlType = CvarControlSettings['type'];

const cvarControlMap: Record<CvarControlType, FC<CvarControlProps>> = {
  switch: CvarSwitchControl,
  number: CvarNumberControl,
  text: CvarTextControl,
};

export const CvarControl: FC<CvarControlProps> = ({
  cvar,
  value,
  setValue,
  disabled,
}) => {
  const { type, ...controlSettings } = cvarControlOptionsMap[cvar];
  const ControlComponent = cvarControlMap[type];

  return (
    <ControlComponent
      cvar={cvar}
      value={value}
      setValue={setValue}
      disabled={disabled || value == null}
      {...controlSettings}
    />
  );
};

export const ServerCvarControl: FC<{ cvar: Cvar; disabled?: boolean }> = ({
  cvar,
  disabled,
}) => {
  const [value, setValue, loading] = useCvar(cvar);

  return (
    <CvarControl
      cvar={cvar}
      value={value}
      setValue={setValue}
      disabled={disabled || loading}
    />
  );
};
