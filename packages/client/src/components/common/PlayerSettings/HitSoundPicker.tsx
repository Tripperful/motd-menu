import React, { ComponentProps, FC } from 'react';
import {
  assetPathToSrcdsSoundPath,
  hitSoundNames,
  hitSounds,
  HitSoundType,
  SoundInfo,
  srcdsSoundPathToAssetPath,
} from 'src/util/sounds';
import { SoundPicker } from '../SoundPicker';

type HitSoundPicker = Omit<ComponentProps<typeof SoundPicker>, 'options'>;

const hitSoundOptions: SoundInfo[] = Object.entries(hitSounds).map(
  ([hitSoundType, path]) => ({
    path,
    name: hitSoundNames[hitSoundType as HitSoundType],
  }),
);

export const HitSoundPicker: FC<HitSoundPicker> = ({ sound, setSound, disabled }) => {
  return (
    <SoundPicker
      sound={srcdsSoundPathToAssetPath(sound)}
      setSound={(sound) => setSound(assetPathToSrcdsSoundPath(sound))}
      options={hitSoundOptions.map(({ path, name }) => ({
        name,
        path: srcdsSoundPathToAssetPath(path),
      }))}
      disabled={disabled}
    />
  );
};
