import {
  BalancedTeamsData,
  EfpsRankData,
  steamId64ToLegacy,
} from '@motd-menu/common';
import { db } from 'src/db';
import { dbgErr } from '.';

type EfpsCron =
  | 'data_new'
  | 'player_stats'
  | 'match_start'
  | 'match_cancel'
  | 'balance_new';

interface EfpsMatchStartData {
  id: string;
  server: string;
  map: string;
  teamplay: boolean;
  players: {
    steamid: string;
    teamid: number;
  }[];
}

export class EfpsClient {
  private static instance: EfpsClient;

  private constructor(private key: string) {}

  public static getInstance(): EfpsClient {
    const key = process.env.MOTD_EFPS_KEY;

    if (!key) {
      return null;
    }

    if (!EfpsClient.instance) {
      EfpsClient.instance = new EfpsClient(key);
    }

    return EfpsClient.instance;
  }

  private async cronRequest(
    method: 'GET' | 'POST',
    cron: EfpsCron,
    params?: Record<string, string>,
    body?: string,
  ) {
    const url = new URL(`https://hl2dm.everythingfps.com/crons/${cron}.php`);
    url.searchParams.append('key', this.key);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
    }

    const res = await fetch(url.toString(), {
      method,
      body,
    });

    let resJson: any;

    try {
      resJson = await res.json();
    } catch {}

    let resFailed = !res.ok;

    const resStatus = resJson?.status;
    resFailed ||= typeof resStatus === 'boolean' && !resStatus;
    resFailed ||= typeof resStatus === 'number' && resStatus >= 400;

    if (resFailed) {
      const errText =
        'Request to eFPS failed: ' +
        JSON.stringify({
          method,
          url,
          status: res.status,
          resJson,
        });
      dbgErr(errText);
      throw new Error(errText);
    }

    return resJson;
  }

  public async sendMatch(matchId: string) {
    try {
      const efpsStats = await db.matches.getEfpsStats(matchId);

      await this.cronRequest(
        'POST',
        'data_new',
        null,
        JSON.stringify(efpsStats),
      );

      await db.matches.markSentToEfps(matchId);

      return true;
    } catch (e) {
      dbgErr('Failed to send eFPS stats (match id: ' + matchId + '): ', e);
    }

    return false;
  }

  public async getRankData(steamId: string) {
    try {
      const efpsData = (await this.cronRequest('GET', 'player_stats', {
        steamId: steamId64ToLegacy(steamId),
      })) as Record<string, string>;

      if (efpsData.rank) {
        const [pos, max] = efpsData.place.split(' of ').map(Number);
        const title = efpsData.rank;

        return {
          title,
          points: Number(efpsData.points),
          pos,
          max,
        } as EfpsRankData;
      }
    } catch {}

    return null;
  }

  public async notifyMatchStarted(data: EfpsMatchStartData) {
    try {
      await this.cronRequest('POST', 'match_start', null, JSON.stringify(data));
    } catch (e) {
      dbgErr(e);
    }
  }

  public async notifyMatchCanceled(matchId: string) {
    try {
      await this.cronRequest(
        'POST',
        'match_cancel',
        null,
        JSON.stringify({ id: matchId }),
      );
    } catch (e) {
      dbgErr(e);
    }
  }

  public async balanceTeams(steamIds: string[]): Promise<BalancedTeamsData> {
    try {
      const res = await this.cronRequest(
        'POST',
        'balance_new',
        null,
        JSON.stringify(steamIds),
      );

      if (!Array.isArray(res) || !res.length) {
        return null;
      }

      return res;
    } catch (e) {
      dbgErr(e);
      return null;
    }
  }
}

const checkInterval = 60_000;
const sendAttempts = 10;

export class EfpsWatchdog {
  private interval: NodeJS.Timeout;
  private attempts: Record<string, number> = {};

  constructor() {
    this.interval = setInterval(() => {
      this.sendUnsentMatches();
    }, checkInterval);
  }

  private async sendUnsentMatches() {
    const lostMatchesIds = await db.matches.getNotSentToEfps();

    if (!lostMatchesIds?.length) {
      return;
    }

    await Promise.allSettled(
      lostMatchesIds.map(async (matchId) => {
        if (this.attempts[matchId] >= sendAttempts) {
          return;
        }

        this.attempts[matchId] = (this.attempts[matchId] ?? 0) + 1;

        console.warn(
          `Sending a missing match ${matchId} to eFPS, attempt #${this.attempts[matchId]}`,
        );

        const success = await EfpsClient.getInstance()?.sendMatch(matchId);

        if (success) {
          delete this.attempts[matchId];
          console.warn(`Successfully sent a missing match ${matchId} to eFPS`);
        }
      }),
    );
  }

  public destroy() {
    clearInterval(this.interval);
  }
}
