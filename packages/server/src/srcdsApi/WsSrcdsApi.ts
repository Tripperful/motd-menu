import { Cvar, OnlinePlayerInfo, WsMessageType } from '@motd-menu/common';
import { wsApi } from 'src/ws';
import { SrcdsApi } from './SrcdsApi';

export class WsSrcdsApi implements SrcdsApi {
  constructor(private remoteId: string) {}

  private async request<TReqData, TResData>(
    type: WsMessageType,
    data?: TReqData,
  ) {
    return await wsApi.request<TReqData, TResData>(this.remoteId, type, data);
  }

  private async send<TData>(type: WsMessageType, data?: TData) {
    return await wsApi.send(this.remoteId, type, data);
  }

  async auth(token: string): Promise<OnlinePlayerInfo> {
    return (
      await this.request<string, OnlinePlayerInfo>('motd_auth_request', token)
    ).data;
  }

  async closeMenu(token: string): Promise<void> {
    await this.send('motd_close', token);
  }

  async getCvars<TCvars extends Cvar>(
    ...cvars: TCvars[]
  ): Promise<{ [cvar in TCvars]: string }> {
    return (
      await this.request<TCvars[], { [cvar in TCvars]: string }>(
        'get_cvars_request',
        cvars,
      )
    ).data;
  }

  async setCvar(cvar: Cvar, value: string): Promise<void> {
    await this.send('set_cvar', { cvar, value });
  }

  async setPlayerTeam(userId: number, teamIndex: number): Promise<void> {
    await this.send('set_player_team', { userId, teamIndex });
  }

  async getMaps(): Promise<string[]> {
    return (await this.request<never, string[]>('get_maps_request')).data;
  }

  async changelevel(token: string, mapName: string): Promise<void> {
    await this.send('changelevel', { token, mapName });
  }

  async getOnlinePlayers(): Promise<OnlinePlayerInfo[]> {
    return (
      await this.request<never, OnlinePlayerInfo[]>('get_players_request')
    ).data;
  }

  async startMatch(
    token: string,
    preTimerCommands?: string[],
    postTimerCommands?: string[],
  ): Promise<void> {
    await this.send('start_match', {
      token,
      preTimerCommands: preTimerCommands.join(';'),
      postTimerCommands: postTimerCommands.join(';'),
    });
  }
}
