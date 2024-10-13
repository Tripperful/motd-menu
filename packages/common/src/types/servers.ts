export interface ServerInfo {
  id: number;
  name: string;
  ip?: string;
  port?: number;
  blocked?: boolean;
  isDev: boolean;
  versionHash?: string;
  sessionId?: string;
}
