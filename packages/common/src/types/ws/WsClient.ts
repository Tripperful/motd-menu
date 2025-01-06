export interface WsClient {
  send(data: string): void;
  close(): void;
}
