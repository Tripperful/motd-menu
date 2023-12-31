import { Cvar } from '@motd-menu/common';
import { RconApi, SrcdsRcon } from 'src/rcon';
import { dbgInfo, dbgWarn, uSteamIdTo64 } from 'src/util';
import { config } from '~root/config';
import { SrcdsApi } from './SrcdsApi';

export class RconSrcdsApi implements SrcdsApi {
  private connections: Record<string, RconApi> = {};

  constructor(
    private ip: string,
    private port: number,
  ) {}

  private get rcon() {
    const { ip, port } = this;
    const host = ip + ':' + port;

    if (!this.connections[host]) {
      this.connections[host] = new SrcdsRcon(ip, port, config.rconPassword);
    }

    return this.connections[host];
  }

  async auth(token: string) {
    dbgInfo(`Received auth request for token ${token}`);

    const res = await this.rcon.exec('motd_menu_auth ' + token);

    dbgInfo(`Auth response: ${res}`);

    const credentials = res.split('\n');

    const [prefixAndName, userIdStr] = credentials;
    const steamId = uSteamIdTo64(credentials[2]);
    const name = prefixAndName.substring(25);

    dbgInfo(
      `Parsed response credentials: ${JSON.stringify({
        name,
        userIdStr,
        steamId,
      })}}`,
    );

    if (!(name && userIdStr && steamId)) {
      dbgWarn(
        `Failed to authenticate token ${token} due to partially missing credentials`,
      );

      return null;
    }

    const userId = Number(userIdStr);

    dbgInfo(
      `Authenticated token ${token}, credentials: ${JSON.stringify({
        name,
        userId,
        steamId,
      })}`,
    );

    return { steamId, name, userId };
  }

  async closeMenu(token: string) {
    await this.rcon.exec('motd_menu_close ' + token);
  }

  async getCvars<TCvars extends Cvar>(...cvars: TCvars[]) {
    const res = await this.rcon.exec(cvars.join(';'));

    return Object.fromEntries(
      [...res.matchAll(/^"(.+?)" = "(.*)"( \( def\. .+$|$)/gm)]
        .filter((entry) => cvars.includes(entry[1] as TCvars))
        .map((entry) => [entry[1], entry[2]]),
    ) as { [cvar in TCvars]: string };
  }

  async setCvar(cvar: Cvar, value: string) {
    // Surround with quites if it has spaces and isn't quoted yet.
    const sanitizedValue =
      value.includes(' ') && !value.startsWith('"') ? '"' + value + '"' : value;

    await this.rcon.exec(cvar + ' ' + sanitizedValue);
  }

  async setPlayerTeam(userId: number, teamIndex: number) {
    await this.rcon.exec(`motd_team_change ${userId} ${teamIndex}`);
  }

  async getMaps() {
    const res = await this.rcon.exec('maps *');

    return [...res.matchAll(/^PENDING:.+?(\S+)$/gm)].map((entry) => entry[1]);
  }

  async changelevel(token: string, mapName: string) {
    await this.rcon.exec(`mm_changelevel ${token} ${mapName}`);
  }

  async getOnlinePlayersSteamIds() {
    const rconRes = await this.rcon.exec('status');

    return [
      ...(rconRes.matchAll(
        /^#\s+(\d+)\s+"(.+)"\s+\[U:\d:(\d+)\]\s+[\d:]+\s+\d+\s+\d+\s+active/gm,
      ) ?? []),
    ].map((entry) => uSteamIdTo64(entry[3]));
  }
}
