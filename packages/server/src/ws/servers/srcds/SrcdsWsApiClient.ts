import {
  BaseWsApiClient,
  ClientSettingsMetadataData,
  IWebSocket,
  ServerInfo,
  SrcdsWsSendSchema,
} from '@motd-menu/common';
import { wsMessagesCounter } from 'src/metrics';
import { dbgWarn } from 'src/util';

export class SrcdsWsApiClient extends BaseWsApiClient<
  SrcdsWsSendSchema,
  ServerInfo
> {
  public settingsMetadata: ClientSettingsMetadataData;
  private pingInterval = 1000;

  constructor(id: string, socket: IWebSocket, info: ServerInfo) {
    super(id, socket, info);

    const sendPing = async () => {
      try {
        this.setNextRequestTimeout(3000);
        await this.request('ping_request');
        setTimeout(sendPing, this.pingInterval);
      } catch (err) {
        this.getSocket().terminate();
      }
    };

    sendPing();
  }

  override onDataSent(data: any): void {
    wsMessagesCounter.inc({
      direction: 'outgoing',
      type: data.type ?? 'unknown',
      server: this.getInfo().name ?? 'unknown',
    });
  }
}
