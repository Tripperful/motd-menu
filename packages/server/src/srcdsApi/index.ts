import { dbgInfo } from 'src/util';
import { RconSrcdsApi } from './RconSrcdsApi';
import { SrcdsApi } from './SrcdsApi';
import { WsSrcdsApi } from './WsSrcdsApi';

const srcdsApis: Record<string, SrcdsApi> = {};

export type SrcdsIdentity =
  | {
      protocol: 'rcon';
      ip: string;
      port: number;
    }
  | {
      protocol: 'ws';
      remoteId: string;
    };

const createSrcdsApi = (srcdsIdentity: SrcdsIdentity): SrcdsApi => {
  switch (srcdsIdentity.protocol) {
    case 'rcon':
      return new RconSrcdsApi(srcdsIdentity.ip, srcdsIdentity.port);
    case 'ws':
      return new WsSrcdsApi(srcdsIdentity.remoteId);
  }
};

export const getSrcdsApi: (srcdsIdentity: SrcdsIdentity) => SrcdsApi = (
  srcdsIdentity,
) => {
  const apiHost = JSON.stringify(srcdsIdentity);
  let api = srcdsApis[apiHost];

  if (!api) {
    dbgInfo(`Creating a new SRCDS API instance for ${apiHost}`);

    api = createSrcdsApi(srcdsIdentity);
    srcdsApis[apiHost] = api;
  }

  return api;
};
