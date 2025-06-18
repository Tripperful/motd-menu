export const enum SoundClientSettingCategory {
  Default = 0,
}

interface BaseClientSettingMetadata<TValue> {
  type: unknown;
  section: string;
  name: string;
  description: string;
  sortOrder: number;
  defaultValue: TValue;
}

export interface BoolClientSettingMetadata
  extends BaseClientSettingMetadata<boolean> {
  type: 'bool';
}

interface BaseIntClientSettingMetadata
  extends BaseClientSettingMetadata<number> {
  min?: number;
  max?: number;
}

export interface IntClientSettingMetadata extends BaseIntClientSettingMetadata {
  type: 'int';
}

export interface IntToggleClientSettingMetadata
  extends BaseIntClientSettingMetadata {
  type: 'int_toggle';
  offValue: number;
  onValue: number;
}

export interface SoundClientSettingMetadata
  extends BaseClientSettingMetadata<string> {
  type: 'sound';
  category?: SoundClientSettingCategory;
}

export type ClientSettingMetadata =
  | BoolClientSettingMetadata
  | IntClientSettingMetadata
  | IntToggleClientSettingMetadata
  | SoundClientSettingMetadata;

export type ClientSettingValue<TSetting extends ClientSettingMetadata> =
  TSetting['defaultValue'];

export type ClientSettingsValues = Record<
  string,
  ClientSettingValue<ClientSettingMetadata>
>;
