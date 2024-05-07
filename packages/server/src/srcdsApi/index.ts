import { SrcdsApi } from './SrcdsApi';
import { WsSrcdsApi } from './WsSrcdsApi';

const srcdsApis: Record<string, SrcdsApi> = {};

const createSrcdsApi = (remoteId: string): SrcdsApi => {
  return new WsSrcdsApi(remoteId);
};

export const getSrcdsApi: (remoteId: string) => SrcdsApi = (remoteId) => {
  let api = srcdsApis[remoteId];

  if (!api) {
    api = createSrcdsApi(remoteId);
    srcdsApis[remoteId] = api;
  }

  return api;
};
