import {
  BoolClientSettingMetadata,
  ClientSettingMetadata,
  EnumClientSettingMetadata,
  IntClientSettingMetadata,
  IntToggleClientSettingMetadata,
  SoundClientSettingMetadata,
} from '@motd-menu/common';
import React, { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { getPickableSounds, SoundCategory } from 'src/util/sounds';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';
import { DropDown } from '../DropDown';
import { SoundPicker } from '../SoundPicker';
import { Switch } from '../Switch';

const useStyles = createUseStyles({
  settingName: {},
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  slider: {
    minWidth: '20em',
    flexGrow: 1,
    fontSize: 'inherit',
    '-webkit-appearance': 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    margin: '0',
    '&::-webkit-slider-runnable-track': {
      backgroundColor: theme.bg2,
      borderRadius: '1em',
    },
    '&::-webkit-slider-thumb': {
      '-webkit-appearance': 'none',
      width: '1em',
      height: '1em',
      borderRadius: '1em',
      background: theme.fg3,
      margin: '-0.25em 0',
    },
    '&:not([disabled])': {
      '&::-webkit-slider-thumb': {
        ...activeItem(),
        background: theme.fg1,
      },
    },
  },
  enum: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.2em',
  },
  sliderDisabled: {
    color: theme.fg3,
    width: '22em',
    textAlign: 'center',
  },
  numDisplay: {
    width: '2em',
    marginRight: '-0.5em',
    textAlign: 'center',
  },
  description: {
    fontSize: '0.8em',
    color: theme.fg3,
    marginTop: '0.25em',
  },
});

type PlayerSettingControlProps<
  TSettingMetadata extends ClientSettingMetadata,
  TValue = TSettingMetadata['defaultValue'],
> = {
  disabled?: boolean;
  metadata: TSettingMetadata;
  value: TValue;
  setValue: (value: TValue) => void;
};

const BoolSettingControl: FC<
  PlayerSettingControlProps<BoolClientSettingMetadata>
> = ({ disabled, metadata, value, setValue }) => {
  const c = useStyles();
  return (
    <span className={c.row}>
      <Switch disabled={disabled} active={value} setActive={setValue} />
      <span className={c.settingName}>{metadata.name}</span>
    </span>
  );
};

const IntClientSettingControl: FC<
  PlayerSettingControlProps<IntClientSettingMetadata> & {
    toggleControl?: JSX.Element;
    isOff?: boolean;
  }
> = ({ disabled, metadata, value, setValue, toggleControl, isOff }) => {
  const c = useStyles();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
  };

  const updateValue = () => {
    if (localValue != value) {
      setValue(localValue);
    }
  };

  return (
    <div>
      <div className={c.row}>
        {toggleControl}
        <span className={c.settingName}>{metadata.name}</span>
      </div>
      {isOff ? (
        <span className={c.sliderDisabled}>Disabled</span>
      ) : (
        <span className={c.row}>
          <input
            className={c.slider}
            type="range"
            disabled={disabled}
            value={localValue}
            onChange={onChange}
            min={metadata.min}
            max={metadata.max}
            step={1}
            onMouseUp={updateValue}
          />
          <span className={c.numDisplay}>{localValue}</span>
        </span>
      )}
    </div>
  );
};

const IntToggleClientSettingControl: FC<
  PlayerSettingControlProps<IntToggleClientSettingMetadata>
> = (props) => {
  const {
    disabled,
    metadata: { type, onValue, offValue, ...restMetadata },
    ...intProps
  } = props;

  const isOff = intProps.value === offValue;

  return (
    <IntClientSettingControl
      disabled={disabled || isOff}
      {...intProps}
      metadata={{
        type: 'int',
        ...restMetadata,
      }}
      isOff={isOff}
      toggleControl={
        <Switch
          disabled={disabled}
          active={intProps.value !== offValue}
          setActive={(active) => intProps.setValue(active ? onValue : offValue)}
        />
      }
    />
  );
};

const EnumClientSettingControl: FC<
  PlayerSettingControlProps<EnumClientSettingMetadata>
> = ({ metadata, value, setValue }) => {
  const c = useStyles();

  return (
    <div className={c.enum}>
      <span className={c.settingName}>{metadata.name}</span>
      <DropDown
        value={value}
        setValue={setValue}
        options={metadata.options.map((option, idx) => ({
          title: option,
          value: idx,
        }))}
      />
    </div>
  );
};

const SoundClientSettingControl: FC<
  PlayerSettingControlProps<SoundClientSettingMetadata>
> = ({ metadata, value, setValue }) => {
  const c = useStyles();
  return (
    <div>
      <span className={c.settingName}>{metadata.name}</span>
      <SoundPicker
        sound={value}
        setSound={setValue}
        options={getPickableSounds(SoundCategory.Default)}
      />
    </div>
  );
};

const controlsMap: Record<
  ClientSettingMetadata['type'],
  FC<PlayerSettingControlProps<ClientSettingMetadata>>
> = {
  bool: BoolSettingControl,
  int: IntClientSettingControl,
  int_toggle: IntToggleClientSettingControl,
  enum: EnumClientSettingControl,
  sound: SoundClientSettingControl,
};

export const PlayerSettingControl = <
  TSettingMetadata extends ClientSettingMetadata,
>(
  props: PlayerSettingControlProps<TSettingMetadata>,
) => {
  const c = useStyles();
  const { metadata } = props;
  const ControlComponent = controlsMap[metadata.type];

  return (
    <div>
      <ControlComponent {...props} />
      <div className={c.description}>{metadata.description}</div>
    </div>
  );
};
