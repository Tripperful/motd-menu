import { Cvar, OnlinePlayerInfo } from '@motd-menu/common';
import { MockUdpServer } from 'src/mock/MockUdpServer';
import { JsonUdp, JsonUdpMessageType } from 'src/udp';
import { SrcdsApi } from './SrcdsApi';

let jsonUdp: JsonUdp;

if (process.env.MOTD_UDP_PORT) {
  jsonUdp = new JsonUdp(
    Number(process.env.MOTD_UDP_PORT),
    process.env.MOTD_AES_PASSWORD,
  );
}

if (process.env.MOTD_MOCK_UDP_SERVER_PORT) {
  const mockServer = new MockUdpServer(
    new JsonUdp(
      Number(process.env.MOTD_MOCK_UDP_SERVER_PORT),
      process.env.MOTD_AES_PASSWORD,
      'MOCK UDP SERVER',
    ),
  );

  mockServer.start();
}

export class UdpSrcdsApi implements SrcdsApi {
  constructor(
    private ip: string,
    private port: number,
  ) {}

  private async request<TReqData, TResData>(
    type: JsonUdpMessageType,
    data?: TReqData,
  ) {
    return await jsonUdp.request<TReqData, TResData>(
      this.ip,
      this.port,
      type,
      data,
    );
  }

  private async send<TData>(type: JsonUdpMessageType, data?: TData) {
    return await jsonUdp.send(this.ip, this.port, type, data);
  }

  async auth(token: string): Promise<OnlinePlayerInfo> {
    return (
      await this.request<string, OnlinePlayerInfo>(
        JsonUdpMessageType.MotdAuthRequest,
        token,
      )
    ).data;
  }

  async closeMenu(token: string): Promise<void> {
    await this.send(JsonUdpMessageType.MotdMenuClose, token);
  }

  async getCvars<TCvars extends Cvar>(
    ...cvars: TCvars[]
  ): Promise<{ [cvar in TCvars]: string }> {
    return (
      await this.request<TCvars[], { [cvar in TCvars]: string }>(
        JsonUdpMessageType.CvarsRequest,
        cvars,
      )
    ).data;
  }

  async setCvar(cvar: Cvar, value: string): Promise<void> {
    await this.send(JsonUdpMessageType.SetCvar, { cvar, value });
  }

  async setPlayerTeam(userId: number, teamIndex: number): Promise<void> {
    await this.send(JsonUdpMessageType.SetPlayerTeam, { userId, teamIndex });
  }

  async getMaps(): Promise<string[]> {
    return (await this.request<never, string[]>(JsonUdpMessageType.MapsRequest))
      .data;
  }

  async changelevel(token: string, mapName: string): Promise<void> {
    await this.send(JsonUdpMessageType.ChangeLevel, { token, mapName });
  }

  async getOnlinePlayers(): Promise<OnlinePlayerInfo[]> {
    return (
      await this.request<never, OnlinePlayerInfo[]>(
        JsonUdpMessageType.OnlinePlayersRequest,
      )
    ).data;
  }

  async startMatch(
    token: string,
    preTimerCommands?: string[],
    postTimerCommands?: string[],
  ): Promise<void> {
    await this.send(JsonUdpMessageType.StartMatch, {
      token,
      preTimerCommands,
      postTimerCommands,
    });
  }
}
