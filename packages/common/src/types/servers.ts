export interface ServerInfo {
  id: number;
  name: string;
  ip?: string;
  port?: number;
  blocked?: boolean;
}

export interface OnlineServerInfo {
  sessionId: string;
  serverInfo: ServerInfo;
}
