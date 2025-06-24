import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const preferredLanguagesState = createGlobalState(() =>
  motdApi.getPreferredLanguages(),
);

export const usePreferredLanguages = () =>
  preferredLanguagesState.useExternalState();

export const setPreferredLanguages = (
  languages: Parameters<typeof preferredLanguagesState.set>[0],
) => preferredLanguagesState.set(languages);
