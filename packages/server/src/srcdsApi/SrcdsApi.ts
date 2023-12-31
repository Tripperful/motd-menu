import { Cvar } from '@motd-menu/common';

export interface SrcdsAuthRes {
  steamId: string;
  name: string;
  userId: number;
}

export interface SrcdsApi {
  auth(token: string): Promise<SrcdsAuthRes>;
  closeMenu(token: string): Promise<void>;
  getCvars<TCvars extends Cvar>(
    ...cvars: TCvars[]
  ): Promise<{ [cvar in TCvars]: string }>;
  setCvar(cvar: Cvar, value: string): Promise<void>;
  setPlayerTeam(userId: number, teamIndex: number): Promise<void>;
  getMaps(): Promise<string[]>;
  changelevel(token: string, mapName: string): Promise<void>;
  getOnlinePlayersSteamIds(): Promise<string[]>;
}
