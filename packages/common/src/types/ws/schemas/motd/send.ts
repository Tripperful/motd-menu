import { StreamFrame } from '../../../stream';
import { WsApiSchema } from '../WsApiSchema';

export type MotdWsSendSchema = WsApiSchema<{
  stream_frame: {
    reqData: StreamFrame;
  };
}>;
