import { dbgInfo } from 'src/util';
import { SrcdsApi } from './SrcdsApi';
import { WsSrcdsApi } from './WsSrcdsApi';

const srcdsApis: Record<string, SrcdsApi> = {};

export type SrcdsIdentity = {
  protocol: 'ws';
  remoteId: string;
};

const createSrcdsApi = (srcdsIdentity: SrcdsIdentity): SrcdsApi => {
  switch (srcdsIdentity.protocol) {
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
    api = createSrcdsApi(srcdsIdentity);
    srcdsApis[apiHost] = api;
  }

  dbgInfo(`SRCDS API instance for ${apiHost} created`);

  return api;
};
