import {
  Cvar,
  OnlinePlayerInfo,
  PlayerClientSettings,
  RankUpdateData,
} from '@motd-menu/common';

export interface SrcdsApi {
  auth(token: string): Promise<OnlinePlayerInfo>;
  closeMenu(token: string): void;
  openMenu(clients: string[], url: string): void;
  getCvars<TCvars extends Cvar>(
    ...cvars: TCvars[]
  ): Promise<{ [cvar in TCvars]: string }>;
  setCvar(cvar: Cvar, value: string): void;
  setPlayerTeam(userId: number, teamIndex: number): void;
  getMaps(): Promise<string[]>;
  changelevel(token: string, mapName: string): void;
  getOnlinePlayers(): Promise<OnlinePlayerInfo[]>;
  startMatch(
    token: string,
    preTimerCommands?: string[],
    postTimerCommands?: string[],
  ): void;
  applySettings(steamId: string, settings: PlayerClientSettings): void;
  runCommand(command: string): void;
  chatPrint(text: string, clients: string[]): void;
  clientExec(steamId: string, command: string): void;
  rankUpdate(ranksData: RankUpdateData[], show?: boolean): void;
}
