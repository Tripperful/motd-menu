import { db } from 'src/db';
import { dbgErr } from '.';

/**
 * @returns success
 */
export const sendMatchToEfps = async (matchId: string) => {
  try {
    const efpsStats = await db.matches.getEfpsStats(matchId);

    const res = await fetch(process.env.MOTD_EFPS_STATS_POST_URL, {
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
