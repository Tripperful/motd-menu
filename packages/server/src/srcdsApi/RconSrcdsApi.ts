import {
  Cvar,
  OnlinePlayerInfo,
  StartMatchSettings,
  matchCvars,
} from '@motd-menu/common';
import { RconApi, SrcdsRcon } from 'src/rcon';
import { dbgInfo, dbgWarn, sanitizeCvarValue, uSteamIdTo64 } from 'src/util';
import { config } from '~root/config';
import { SrcdsApi } from './SrcdsApi';
import { getPlayersProfiles } from 'src/steam';

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
    const sanitizedValue = sanitizeCvarValue(value);

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

  async getOnlinePlayers() {
    const rconRes = await this.rcon.exec('status');

    return [
      ...(rconRes.matchAll(
        /^#\s+(\d+)\s+"(.+)"\s+\[U:\d:(\d+)\]\s+[\d:]+\s+\d+\s+\d+\s+active/gm,
      ) ?? []),
    ].map(
      (entry) =>
        ({
          userId: Number(entry[1]),
          name: entry[2],
          steamId: uSteamIdTo64(entry[3]),
        }) as OnlinePlayerInfo,
    );
  }

  /**
   * @throws the reason why the match couldn't be started.
   */
  async startMatch(token: string, settings: StartMatchSettings): Promise<void> {
    const onlinePlayers = await this.getOnlinePlayers();
    const setTeamCommands: string[] = [];

    if (!settings.players || Object.keys(settings.players).length < 2) {
      throw 'At least 2 players are required to start a match';
    }

    for (const [steamId, teamIndex] of Object.entries(settings.players)) {
      const player = onlinePlayers.find((p) => p.steamId === steamId);

      if (!player) {
        const disconnectedPlayer = (await getPlayersProfiles([steamId]))[
          steamId
        ];
        const disconnectedPlayerName = disconnectedPlayer?.name ?? steamId;

        throw `Failed to start the match (${disconnectedPlayerName} left the game)`;
      }

      setTeamCommands.push(`motd_team_change ${player.userId} ${teamIndex}`);
    }

    await this.rcon.exec(setTeamCommands.join(';'));

    const cvars = (Object.entries(settings.cvars ?? {}) as [Cvar, string][])
      .filter(([cvar]) => matchCvars.includes(cvar))
      .map(([cvar, value]) => `${cvar} ${sanitizeCvarValue(value)}`);

    await this.rcon.exec(`motd_match_start ${token} ${btoa(cvars.join(';'))}`);
  }
}
