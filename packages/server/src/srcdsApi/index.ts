import { dbgInfo } from 'src/util';
import { RconSrcdsApi } from './RconSrcdsApi';
import { SrcdsApi } from './SrcdsApi';

const srcdsApis: Record<string, SrcdsApi> = {};

export const getSrcdsApi: (ip: string, port: number) => SrcdsApi = (
  ip,
  port,
) => {
  const apiHost = ip + ':' + port;
  let api = srcdsApis[apiHost];

  if (!api) {
    dbgInfo(`Creating a new SRCDS API instance for ${apiHost}`);

    api = new RconSrcdsApi(ip, port);
    srcdsApis[apiHost] = api;
  }

  return api;
};
