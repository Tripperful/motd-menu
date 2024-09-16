import {
  Cvar,
  MotdOpenAction,
  OnlinePlayerInfo,
  PlayerClientSettings,
  RankUpdateData,
  SetSettingsAction,
  StreamFrame,
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

  openMenu(clients: string[], url: string): void {
    this.send('motd_open', { clients, url } as MotdOpenAction);
  }

  closeMenu(token: string): void {
    this.send('motd_close', token);
  }

  async getCvars<TCvars extends Cvar>(
    ...cvars: TCvars[]
  ): Promise<{ [cvar in TCvars]: string }> {
    return (
      (
        await this.request<TCvars[], { [cvar in TCvars]: string }>(
          'get_cvars_request',
          cvars,
        )
      ).data ?? ({} as { [cvar in TCvars]: string })
    );
  }

  setCvar(cvar: Cvar, value: string): void {
    this.send('set_cvar', { cvar, value });
  }

  setPlayerTeam(userId: number, teamIndex: number): void {
    this.send('set_player_team', { userId, teamIndex });
  }

  async getMaps(): Promise<string[]> {
    return (await this.request<never, string[]>('get_maps_request')).data ?? [];
  }

  changelevel(token: string, mapName: string): void {
    this.send('changelevel', { token, mapName });
  }

  async getOnlinePlayers(): Promise<OnlinePlayerInfo[]> {
    return (
      (await this.request<never, OnlinePlayerInfo[]>('get_players_request'))
        .data ?? []
    );
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
    {
      drawViewmodel,
      esp,
      dsp,
      fov,
      magnumZoomFov,
      crossbowZoomFov,
      hitSound,
      killSound,
      kevlarSound,
    }: PlayerClientSettings,
  ): void {
    this.send('apply_settings', {
      steamId,
      settings: {
        drawviewmodel: drawViewmodel ? 1 : 0,
        esp: esp ? 1 : 0,
        dsp: dsp ? 1 : 0,
        fov,
        magnumZoomFov,
        crossbowZoomFov,
        hitsound: hitSound ? 1 : 0,
        killsound: killSound ? 1 : 0,
        kevlarsound: kevlarSound ? 1 : 0,
      },
    } as SetSettingsAction);
  }

  runCommand(commands: string): void {
    this.send('run_command', { commands });
  }

  chatPrint(text: string, clients: string[]): void {
    this.send('chat_print', { text, clients });
  }

  rankUpdate(ranksData: RankUpdateData[], show = true): void {
    this.send(
      'rank_update',
      ranksData.map((data) => ({
        ...data,
        show,
      })),
    );
  }

  clientExec(steamId: string, command: string): void {
    this.send('client_exec', { steamId, command });
  }
}
