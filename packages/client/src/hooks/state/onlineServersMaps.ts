import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const onlineServersMapsState = createGlobalState(() =>
  motdApi.getOnlineServersMaps(),
);

export const useOnlineServersMaps = () =>
  onlineServersMapsState.useExternalState();
