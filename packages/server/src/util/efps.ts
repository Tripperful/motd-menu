import { steamId64ToLegacy } from '@motd-menu/common';
import { RankData } from '@motd-menu/common/src/types/ws/schemas/srcds/payloads';
import { db } from 'src/db';
import { dbgErr } from '.';
import { colorByRank } from './ranks';

const efpsUrl = (path: string, params?: Record<string, string>) => {
  const url = new URL(`https://hl2dm.everythingfps.com/crons/${path}.php`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
  }

  url.searchParams.append('key', process.env.MOTD_EFPS_KEY);

  return url.toString();
};

export const getEfpsRank = async (steamId: string) => {
  const steamIdLegacy = steamId64ToLegacy(steamId);

  try {
    const res = await fetch(
      efpsUrl('player_stats', { steamId: steamIdLegacy }),
    );

    const data = (await res.json()) as Record<string, string>;

    const [pos, max] = data.place.split(' of ').map(Number);
    const color = colorByRank(data.rank);

    return {
      steamId,
      points: Number(data.points),
      rank: data.rank,
      pos,
      max,
      ...color,
    } as RankData;
  } catch {
    return null as RankData;
  }
};

/**
 * @returns success
 */
export const sendMatchToEfps = async (matchId: string) => {
  try {
    const efpsStats = await db.matches.getEfpsStats(matchId);

    const res = await fetch(efpsUrl('data_new'), {
      method: 'POST',
      body: JSON.stringify(efpsStats),
    });

    if (!res.ok) {
      dbgErr('Error response from eFPS stats post endpoint');
      dbgErr('Response status: ' + res.status);
      dbgErr('Response body: ' + (await res.text()));
      throw new Error('Failed to send eFPS stats');
    }

    await db.matches.markSentToEfps(matchId);

    return true;
  } catch {
    dbgErr('Failed to send eFPS stats (match id: ' + matchId + ')');
  }

  return false;
};

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

        const success = await sendMatchToEfps(matchId);

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
