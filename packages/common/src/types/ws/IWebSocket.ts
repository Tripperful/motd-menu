export interface IWebSocket {
  send(data: string): void;
  close(): void;
}
