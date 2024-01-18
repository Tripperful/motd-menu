import { SrcdsProtocol } from '@motd-menu/common';
import { dbgInfo } from 'src/util';
import { RconSrcdsApi } from './RconSrcdsApi';
import { SrcdsApi } from './SrcdsApi';
import { UdpSrcdsApi } from './UdpSrcdsApi';

const srcdsApis: Record<string, SrcdsApi> = {};

const createSrcdsApi = (
  protocol: SrcdsProtocol,
  ip: string,
  port: number,
): SrcdsApi => {
  switch (protocol) {
    case 'rcon':
      return new RconSrcdsApi(ip, port);
    case 'udp':
      return new UdpSrcdsApi(ip, port);
  }
};

export const getSrcdsApi: (
  protocol: SrcdsProtocol,
  ip: string,
  port: number,
) => SrcdsApi = (protocol, ip, port) => {
  const apiHost = `${protocol}:${ip}:${port}`;
  let api = srcdsApis[apiHost];

  if (!api) {
    dbgInfo(`Creating a new SRCDS API instance for ${apiHost}`);

    api = createSrcdsApi(protocol, ip, port);
    srcdsApis[apiHost] = api;
  }

  return api;
};
