import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const onlineServersPlayersState = createGlobalState(() =>
  motdApi.getOnlineServersPlayers(),
);

export const useOnlineServersPlayers = () =>
  onlineServersPlayersState.useExternalState();
