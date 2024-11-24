import './actionHandlers';
import './requestHandlers';

import { BaseWsApiServer } from '@motd-menu/common';
import { SrcdsWsApiServer } from './SrcdsWsApiServer';

BaseWsApiServer.registerWsApiServer(SrcdsWsApiServer.getInstace());
