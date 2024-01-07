import { createGlobalState } from './util';

const remoteTextState = createGlobalState((url: string) =>
  fetch(url).then((r) => r.json()),
);

export const useRemoteText = (url: string) =>
  remoteTextState.useExternalState(url);
