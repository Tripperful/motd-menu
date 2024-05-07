import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const onlineServersState = createGlobalState(() => motdApi.getOnlineServers());

export const useOnlineServers = () => onlineServersState.useExternalState();
