import {
  BaseWsApiClient,
  ServerInfo,
  SrcdsWsSendSchema,
} from '@motd-menu/common';
import { wsMessagesCounter } from 'src/metrics';

export class SrcdsWsApiClient extends BaseWsApiClient<
  SrcdsWsSendSchema,
  ServerInfo
> {
  override onDataSent(data: any): void {
    wsMessagesCounter.inc({
      direction: 'outgoing',
      type: data.type ?? 'unknown',
      server: this.getInfo().name ?? 'unknown',
    });
  }
}
