import {
  BoolCvarProps,
  Cvar,
  CvarType,
  NumberCvarProps,
  OptionCvarProps,
  TextCvarProps,
  cvarsInfo,
} from '@motd-menu/common';
import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useCvar } from 'src/hooks/useCvar';
import { DropDown } from '../DropDown';
import { LabeledInput } from '../LabeledInput';
import { LabeledSwitch } from '../LabeledSwitch';

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
  cvarDropDownControl: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5em',
    margin: '0.5em 0',
  },
});

export const CvarBoolControl: FC<CvarControlProps & BoolCvarProps> = ({
  cvar,
  value,
  setValue,
  disabled,
}) => {
  const { description } = cvarsInfo[cvar];

  return (
    <LabeledSwitch
      active={value && value != '0'}
      setActive={(active) => setValue(active ? '1' : '0', cvar)}
      disabled={disabled}
      label={description}
    />
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
    <LabeledInput
      type="number"
      min={min}
      max={max}
      value={curValue ?? ''}
      onBlur={onBlur}
      onChange={(e) => setCurValue(e.currentTarget.value)}
      disabled={disabled}
      label={description}
    />
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

export const CvarOptionControl: FC<CvarControlProps & OptionCvarProps> = ({
  cvar,
  value,
  setValue,
  disabled,
  options,
}) => {
  const c = useStyles();

  const { description } = cvarsInfo[cvar];

  return (
    <div className={c.cvarDropDownControl}>
      <div>{description}</div>
      <DropDown
        value={value}
        setValue={(v) => setValue(v, cvar)}
        options={options}
        disabled={disabled}
      />
    </div>
  );
};

const cvarControlMap: Record<CvarType, FC<CvarControlProps>> = {
  bool: CvarBoolControl,
  number: CvarNumberControl,
  text: CvarTextControl,
  option: CvarOptionControl,
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
