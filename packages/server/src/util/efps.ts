import { db } from 'src/db';
import { dbgErr } from '.';

export const sendMatchToEfps = async (matchId: string) => {
  try {
    const efpsStats = await db.matches.getEfpsStats(matchId);

    if (efpsStats.server?.toLowerCase()?.includes('dev')) return;

    const res = await fetch(process.env.MOTD_EFPS_STATS_POST_URL, {
      method: 'POST',
      body: JSON.stringify(efpsStats),
    });

    if (!res.ok) {
      throw new Error('Failed to post eFPS stats');
    }

    await db.matches.markSentToEfps(matchId);
  } catch {
    dbgErr('Failed to post eFPS stats (match id: ' + matchId + ')');
  }
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

        await sendMatchToEfps(matchId);
      }),
    );
  }

  public destroy() {
    clearInterval(this.interval);
  }
}
