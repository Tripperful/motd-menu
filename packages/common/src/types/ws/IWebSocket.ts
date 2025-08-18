export interface IWebSocket {
  send(data: string): void;
  close(): void;
  terminate(): void;
  readyState: number;
  OPEN: number;
}
