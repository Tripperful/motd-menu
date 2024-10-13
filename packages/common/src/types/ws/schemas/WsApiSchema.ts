/**
 * WebSocket API Schema
 *
 * Returns never if the schema is invalid
 */
export type WsApiSchema<TSchema> =
  TSchema extends Record<
    string,
    {
      reqData?: unknown;
      resType?: string;
      resData?: unknown;
    }
  >
    ? keyof TSchema[keyof TSchema] extends 'reqData' | 'resType' | 'resData'
      ? TSchema
      : never
    : never;
