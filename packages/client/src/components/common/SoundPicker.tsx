import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { SoundInfo } from 'src/util/sounds';
import SoundIcon from '~icons/sound.svg';
import { activeItem } from '~styles/elements';
import { Popup } from './Popup';
import { usePreferredVolume } from 'src/hooks/usePreferredVolume';
import EditIcon from '~icons/pencil.svg';
import classNames from 'classnames';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  active: {
    ...activeItem(),
  },
  row: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  editIcon: {
    fontSize: '0.75em',
  },
  options: {
    maxHeight: '20em',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    paddingRight: '0.25em',
    marginRight: '-0.75em',
    overflow: 'hidden scroll',
  },
  selected: {
    filter: 'brightness(1.5)',
  },
});

const SoundPickerOption: FC<{
  sound: SoundInfo;
  selected?: boolean;
  onClick: () => void;
  editable?: boolean;
  disabled?: boolean;
}> = ({ sound, selected, onClick, editable, disabled }) => {
  const c = useStyles();

  const volume = usePreferredVolume();

  const audio = useMemo(() => {
    const a = new Audio();
    a.volume = volume;
    return a;
  }, []);

  const playSound = useCallback((snd: string) => {
    if (!snd) return;

    audio.src = snd;
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  }, []);

  const onPlay = useCallback(() => {
    playSound(sound.assetPath);
  }, [sound]);

  return (
    <span className={c.row}>
      <SoundIcon className={c.active} onClick={onPlay} />
      <span
        className={classNames(c.active, c.row)}
        onClick={onClick}
        data-active={selected}
        data-disabled={disabled}
      >
        {sound?.name ?? 'Unknown'}
        {editable && !disabled && <EditIcon className={c.editIcon} />}
      </span>
    </span>
  );
};

export const SoundPicker: FC<{
  sound: string;
  setSound: (sound: string) => void;
  options: SoundInfo[];
  disabled?: boolean;
}> = ({ sound, setSound, options, disabled }) => {
  const c = useStyles();
  const [pickerActive, setPickerActive] = React.useState(false);

  const selectedOption = options.find((o) => o.srcdsPath === sound);

  return (
    <div className={c.root}>
      <SoundPickerOption
        sound={selectedOption}
        onClick={disabled ? undefined : () => setPickerActive(true)}
        editable={!disabled}
        disabled={disabled}
      />
      {pickerActive && (
        <Popup title="Select a sound" onClose={() => setPickerActive(false)}>
          <div className={c.options}>
            {options.map((option) => (
              <SoundPickerOption
                key={option.srcdsPath}
                sound={option}
                selected={option.srcdsPath === sound}
                onClick={() => {
                  setSound(option.srcdsPath);
                  setPickerActive(false);
                }}
              />
            ))}
          </div>
        </Popup>
      )}
    </div>
  );
};
