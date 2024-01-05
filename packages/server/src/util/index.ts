import { v4 } from 'uuid';

export const uuid = v4;

export const sql = (query: string) => query.replaceAll("'", "''");

const steamId64Ident = BigInt('76561197960265728');

export const uSteamIdTo64 = (uSteamId: string) => {
  return (BigInt(uSteamId) + steamId64Ident).toString();
};

export const steamId64ToU = (steamId64: string) => {
  return (BigInt(steamId64) - steamId64Ident).toString();
};

export const logDbgInfo = !!JSON.parse(process.env.MOTD_DEBUG_LOG ?? 'false');

export const dbgInfo: typeof console.info = (...args) => {
  if (!logDbgInfo) return;

  console.info(...args);
};

export const dbgWarn: typeof console.warn = (...args) => {
  if (!logDbgInfo) return;

  console.warn(...args);
};

export const dbgErr: typeof console.error = (...args) => {
  if (!logDbgInfo) return;

  console.error(...args);
};
