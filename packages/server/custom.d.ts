declare namespace Express {
  interface Locals {
    sessionData: import('./src/auth').MotdSessionData;
    command?: string;
    parseCommandRes?: (res: string) => Promise<readonly [number, unknown]>;
    srcdsApi?: import('src/srcdsApi/SrcdsApi').SrcdsApi;
  }
}

declare module '*.sql' {
  const sql: string;
  export default sql;
}
