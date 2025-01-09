import {
  colorByRank,
  composeColoredText,
  EfpsRankData,
  RankData,
  RankUpdateData,
  steamId64ToLegacy,
} from '@motd-menu/common';
import { db } from 'src/db';
import { dbgErr } from '.';

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

export const getRankData = async (steamId: string) => {
  const [customRank, customRankExpiresOn] = await Promise.all([
    db.client.getCustomRank(steamId),
    db.client
      .getCustomRankSubscription(steamId)
      .then((v) => (v ? Number(v) : null)),
  ]);

  let efpsRank: EfpsRankData = null;

  try {
    const res = await fetch(
      efpsUrl('player_stats', { steamId: steamId64ToLegacy(steamId) }),
    );

    const efpsData = (await res.json()) as Record<string, string>;

    if (efpsData.rank) {
      const [pos, max] = efpsData.place.split(' of ').map(Number);
      const title = efpsData.rank;

      efpsRank = {
        title,
        points: Number(efpsData.points),
        pos,
        max,
      };
    }
  } catch {}

  return { steamId, efpsRank, customRank, customRankExpiresOn } as RankData;
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

export const toSrcdsRankData = (data: RankData): RankUpdateData => {
  const { steamId, efpsRank, customRank } = data;

  const { r, g, b } = colorByRank(efpsRank?.title ?? 'iron');
  const pos = efpsRank?.pos ?? 0;
  const max = efpsRank?.max ?? 0;
  const points = efpsRank?.points ?? 0;

  const rank = customRank
    ? composeColoredText(customRank.title, customRank.colorStops)
    : efpsRank?.title;

  return { steamId, rank, points, pos, max, r, g, b };
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
