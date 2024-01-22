import { v4 } from 'uuid';

export const uuid = v4;

export const sql = (query: string) => query.replaceAll("'", "''");

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

// Remove semicolons to prevent command injection.
// Surround with quites if it has spaces and isn't quoted yet.
export const sanitizeCvarValue = (value: string) => {
  value = value.replace(/;/g, '');

  return value === '' || (value.includes(' ') && !value.startsWith('"'))
    ? '"' + value + '"'
    : value;
};
