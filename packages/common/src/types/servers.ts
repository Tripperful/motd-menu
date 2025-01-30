export interface ServerInfo {
  id: number;
  name: string;
  ip?: string;
  port?: number;
  blocked?: boolean;
  isDev: boolean;
  version?: string;
  sessionId?: string;
}
