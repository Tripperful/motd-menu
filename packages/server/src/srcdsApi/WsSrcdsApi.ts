import {
  Cvar,
  OnlinePlayerInfo,
  PlayerClientSettings,
  SetSettingsAction,
  WsMessageType,
} from '@motd-menu/common';
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

  private send<TData>(type: WsMessageType, data?: TData) {
    return wsApi.send(this.remoteId, type, data);
  }

  async auth(token: string): Promise<OnlinePlayerInfo> {
    return (
      await this.request<string, OnlinePlayerInfo>('motd_auth_request', token)
    ).data;
  }

  closeMenu(token: string): void {
    this.send('motd_close', token);
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

  setCvar(cvar: Cvar, value: string): void {
    this.send('set_cvar', { cvar, value });
  }

  setPlayerTeam(userId: number, teamIndex: number): void {
    this.send('set_player_team', { userId, teamIndex });
  }

  async getMaps(): Promise<string[]> {
    return (await this.request<never, string[]>('get_maps_request')).data;
  }

  changelevel(token: string, mapName: string): void {
    this.send('changelevel', { token, mapName });
  }

  async getOnlinePlayers(): Promise<OnlinePlayerInfo[]> {
    return (
      await this.request<never, OnlinePlayerInfo[]>('get_players_request')
    ).data;
  }

  startMatch(
    token: string,
    preTimerCommands?: string[],
    postTimerCommands?: string[],
  ): void {
    this.send('start_match', {
      token,
      preTimerCommands: preTimerCommands.join(';'),
      postTimerCommands: postTimerCommands.join(';'),
    });
  }

  applySettings(
    steamId: string,
    { drawViewmodel, esp, fov, hitSound, killSound }: PlayerClientSettings,
  ): void {
    this.send('apply_settings', {
      steamId,
      settings: {
        drawviewmodel: drawViewmodel ? 1 : 0,
        esp: esp ? 1 : 0,
        fov,
        hitsound: hitSound ? 1 : 0,
        killsound: killSound ? 1 : 0,
      },
    } as SetSettingsAction);
  }
}
