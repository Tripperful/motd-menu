import { motdApi } from 'src/api';
import { createGlobalState } from './util';

const chatCommandsState = createGlobalState(() => motdApi.getChatCommands());

export const useChatCommands = () => chatCommandsState.useExternalState();
