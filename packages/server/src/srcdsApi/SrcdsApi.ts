import { Cvar, OnlinePlayerInfo, StartMatchSettings } from '@motd-menu/common';

export interface SrcdsApi {
  auth(token: string): Promise<OnlinePlayerInfo>;
  closeMenu(token: string): Promise<void>;
  getCvars<TCvars extends Cvar>(
    ...cvars: TCvars[]
  ): Promise<{ [cvar in TCvars]: string }>;
  setCvar(cvar: Cvar, value: string): Promise<void>;
  setPlayerTeam(userId: number, teamIndex: number): Promise<void>;
  getMaps(): Promise<string[]>;
  changelevel(token: string, mapName: string): Promise<void>;
  getOnlinePlayers(): Promise<OnlinePlayerInfo[]>;
  startMatch(token: string, settings: StartMatchSettings): Promise<void>;
}
