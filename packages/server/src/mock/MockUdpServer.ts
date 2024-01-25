import { JsonUdp, JsonUdpMessage, JsonUdpMessageType } from 'src/udp';
import { maps } from './maps';
import { players } from './players';

export class MockUdpServer {
  constructor(private socket: JsonUdp) {}

  public async start() {
    this.socket.subscribe((msg) => this.onMessage(msg));
    await this.socket.connect();
  }

  private async onMessage(msg: JsonUdpMessage): Promise<JsonUdpMessage> {
    switch (msg.type) {
      case JsonUdpMessageType.MotdAuthRequest: {
        return {
          type: JsonUdpMessageType.MotdAuthResponse,
          data: players.Tripperful,
        };
      }

      case JsonUdpMessageType.OnlinePlayersRequest: {
        return {
          type: JsonUdpMessageType.OnlinePlayersResponse,
          data: [players.Tripperful, players.tsmc],
        };
      }

      case JsonUdpMessageType.MapsRequest: {
        return {
          type: JsonUdpMessageType.MapsResponse,
          data: maps,
        };
      }

      default:
        return msg.guid
          ? { type: JsonUdpMessageType.RequestTypeUpperBound }
          : null;
    }
  }
}