declare namespace Express {
  interface Locals {
    sessionData: import('./src/auth').MotdSessionData;
    command?: string;
    parseCommandRes?: (res: string) => Promise<readonly [number, unknown]>;
    srcdsApi?: import('src/srcdsApi/SrcdsApi').SrcdsApi;
    tgService?: import('src/telegram').TelegramService;
    tgClientInfo?: import('src/telegram/types').TelegramClientInfo;
  }
}

declare module '*.sql' {
  const sql: string;
  export default sql;
}

declare namespace NodeJS {
  interface ProcessEnv {
    MOTD_ROOT_ADMINS: string;
    MOTD_STEAM_API_KEY: string;
    MOTD_WEB_PORT: string;
    MOTD_WEB_PORT_HTTPS: string;
    MOTD_DEBUG_LOG: string;
    MOTD_SSL_CERT: string;
    MOTD_SSL_PRIVATE_KEY: string;
    MOTD_EFPS_KEY: string;
  }
}
