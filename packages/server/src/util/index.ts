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

type ChatColorFunc = {
  (hexrgb: string): string;
  MOTD: string;
  Yellow: string;
  Info: string;
  Value: string;
  Allow: string;
  Warning: string;
  White: string;
};

export const chatColor: ChatColorFunc = (hexrgb: string) => `\x07${hexrgb}`;

chatColor.MOTD = chatColor('EFF542');
chatColor.Yellow = chatColor('FFB200');
chatColor.Info = chatColor('387cd3');
chatColor.Value = chatColor('99CCFF');
chatColor.Allow = chatColor('40FF40');
chatColor.Warning = chatColor('FF4040');
chatColor.White = chatColor('FFFFFF');
