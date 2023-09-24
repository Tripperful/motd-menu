import { Cvar } from '@motd-menu/common';
import { RconApi, SrcdsRcon } from 'src/rcon';
import { uSteamIdTo64 } from 'src/util';
import { config } from '~root/config';
import { SrcdsApi } from './SrcdsApi';

export class RconSrcdsApi implements SrcdsApi {
  private connections: Record<string, RconApi> = {};
  private token: string;

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
    const res = await this.rcon.exec('motd_menu_auth ' + token);

    const credentials = res.split('\n');

    const [name, userIdStr] = credentials;
    const steamId = uSteamIdTo64(credentials[2]);

    if (!(name && userIdStr && steamId)) {
      return null;
    }

    const userId = Number(userIdStr);

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

  async setPlayerTeam(steamId: string, teamIndex: number) {
    // TODO
    await this.rcon.exec(
      'say Setting ' + steamId + "'s " + 'team to ' + teamIndex,
    );
  }

  async getMaps() {
    const res = await this.rcon.exec('maps *');

    return [...res.matchAll(/^PENDING:.+?(\S+)$/gm)].map((entry) => entry[1]);
  }

  async changelevel(mapName: string) {
    await this.rcon.exec('changelevel ' + mapName);
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
