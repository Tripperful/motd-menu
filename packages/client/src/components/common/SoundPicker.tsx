import classNames from 'classnames';
import React, { FC, useCallback, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { usePreferredVolume } from 'src/hooks/usePreferredVolume';
import { SoundInfo } from 'src/util/sounds';
import EditIcon from '~icons/pencil.svg';
import SoundIcon from '~icons/sound.svg';
import { activeItem } from '~styles/elements';
import { Popup } from './Popup';

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
  selected: {
    filter: 'brightness(1.5)',
  },
  input: {
    flex: '1 1 auto',
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
  const [filter, setFilter] = React.useState('');

  const selectedOption = options.find((o) => o.srcdsPath === sound);

  const filteredOptions = useMemo(() => {
    return options.filter(
      (o) =>
        o.assetPath === selectedOption?.assetPath ||
        o.name.toLowerCase().includes(filter.toLowerCase()) ||
        o.assetPath.includes(filter.toLowerCase()),
    );
  }, [options, filter]);

  return (
    <div className={c.root}>
      <SoundPickerOption
        sound={selectedOption}
        onClick={disabled ? undefined : () => setPickerActive(true)}
        editable={!disabled}
        disabled={disabled}
      />
      {pickerActive && (
        <Popup
          title={
            <input
              type="text"
              className={c.input}
              value={filter}
              placeholder="Search sounds..."
              onChange={(e) => setFilter(e.currentTarget.value)}
              autoFocus
            />
          }
          fullHeight
          onClose={() => setPickerActive(false)}
        >
          {filteredOptions.map((option) => (
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
        </Popup>
      )}
    </div>
  );
};
