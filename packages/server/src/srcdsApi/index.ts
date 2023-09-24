import { RconSrcdsApi } from './RconSrcdsApi';
import { SrcdsApi } from './SrcdsApi';

let api: SrcdsApi;

export const getSrcdsApi: (ip: string, port: number) => SrcdsApi = (
  ip,
  port,
) => {
  if (!api) {
    api = new RconSrcdsApi(ip, port);
  }

  return api;
};
