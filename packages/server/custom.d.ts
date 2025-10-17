declare namespace Express {
  interface Locals {
    sessionData: import('src/auth').MotdSessionData;
    command?: string;
    parseCommandRes?: (res: string) => Promise<readonly [number, unknown]>;
    srcds?: import('src/ws/servers/srcds/SrcdsWsApiClient').SrcdsWsApiClient;
  }
}

declare module '*.sql' {
  const sql: string;
  export default sql;
}

declare namespace NodeJS {
  interface ProcessEnv {
    MOTD_ROOT_ADMINS: string;
    MOTD_WEB_PORT: string;
    MOTD_DOMAIN: string;
    MOTD_EMAIL: string;
    MOTD_DEBUG_LOG: string;
    MOTD_SSL_CERT: string;
    MOTD_SSL_PRIVATE_KEY: string;
    MOTD_EFPS_KEY: string;
    MOTD_MAXMIND_LICENSE_KEY: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    YANDEX_TRANSLATE_API_KEY: string;
  }
}
