import {
  BoolCvarProps,
  Cvar,
  CvarType,
  NumberCvarProps,
  TextCvarProps,
  cvarsInfo,
} from '@motd-menu/common';
import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useCvar } from 'src/hooks/useCvar';
import { Switch } from '../Switch';

export interface CvarControlProps {
  cvar: Cvar;
  value: string;
  setValue: (value: string, cvar: Cvar) => void;
  disabled?: boolean;
}

const useStyles = createUseStyles({
  cvarControl: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  cvarTextControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2em',
    width: '25em',
    '& > div': {
      marginLeft: '0.2em',
    },
  },
});

export const CvarBoolControl: FC<CvarControlProps & BoolCvarProps> = ({
  cvar,
  value,
  setValue,
  disabled,
}) => {
  const c = useStyles();

  const { description } = cvarsInfo[cvar];

  return (
    <div className={c.cvarControl}>
      <Switch
        active={value && value != '0'}
        setActive={(active) => setValue(active ? '1' : '0', cvar)}
        disabled={disabled}
      />
      <div>{description}</div>
    </div>
  );
};

export const CvarNumberControl: FC<CvarControlProps & NumberCvarProps> = ({
  cvar,
  value,
  setValue,
  disabled,
  min = -Infinity,
  max = Infinity,
}) => {
  const c = useStyles();

  const { description } = cvarsInfo[cvar];

  const [curValue, setCurValue] = useState('');

  useEffect(() => {
    setCurValue(value);
  }, [value]);

  const onBlur = () => {
    if (curValue !== value) {
      const clampedValue = String(
        Math.min(max, Math.max(min, Number(curValue))),
      );

      setValue(clampedValue, cvar);
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
      <div>{description}</div>
    </div>
  );
};

export const CvarTextControl: FC<CvarControlProps & TextCvarProps> = ({
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
      setValue(curValue, cvar);
      setCurValue(curValue);
    }
  };

  const { description } = cvarsInfo[cvar];

  return (
    <div className={c.cvarTextControl}>
      <div>{description}</div>
      <input
        type="text"
        value={curValue ?? ''}
        maxLength={maxLength}
        onBlur={onBlur}
        onChange={(e) => setCurValue(e.currentTarget.value)}
        disabled={disabled}
      />
    </div>
  );
};

const cvarControlMap: Record<CvarType, FC<CvarControlProps>> = {
  bool: CvarBoolControl,
  number: CvarNumberControl,
  text: CvarTextControl,
};

export const CvarControl: FC<CvarControlProps> = ({
  cvar,
  value,
  setValue,
  disabled,
}) => {
  const { type, ...controlSettings } = cvarsInfo[cvar];
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
