import { BaseWsApiServer } from '@motd-menu/common';
import { MotdWsApiServer } from './MotdWsApiServer';

BaseWsApiServer.registerWsApiServer(MotdWsApiServer.getInstace());
