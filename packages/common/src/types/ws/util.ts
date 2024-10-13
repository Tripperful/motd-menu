export type WsRequestType<TWsSchema> = {
  [K in keyof TWsSchema]: 'resType' extends keyof TWsSchema[K] ? K : never;
}[keyof TWsSchema];

export type WsQueryRequestType<TWsSchema> = Extract<
  WsRequestType<TWsSchema>,
  {
    [K in keyof TWsSchema]: 'reqData' extends keyof TWsSchema[K] ? K : never;
  }[keyof TWsSchema]
>;

export type WsFetchRequestType<TWsSchema> = Exclude<
  WsRequestType<TWsSchema>,
  WsQueryRequestType<TWsSchema>
>;

export type WsActionType<TWsSchema> = Exclude<
  keyof TWsSchema,
  WsRequestType<TWsSchema>
>;

export type WsSendDataActionType<TWsSchema> = Extract<
  WsActionType<TWsSchema>,
  {
    [K in keyof TWsSchema]: 'reqData' extends keyof TWsSchema[K] ? K : never;
  }[keyof TWsSchema]
>;

export type WsSignalActionType<TWsSchema> = Exclude<
  WsActionType<TWsSchema>,
  WsSendDataActionType<TWsSchema>
>;

export type WsResponsePayloadType<
  TWsSchema,
  TReqest extends WsRequestType<TWsSchema>,
> = 'resData' extends keyof TWsSchema[TReqest]
  ? {
      type: 'resType' extends keyof TWsSchema[TReqest]
        ? TWsSchema[TReqest]['resType']
        : never;
      data: TWsSchema[TReqest]['resData'];
    }
  : {
      type: 'resType' extends keyof TWsSchema[TReqest]
        ? TWsSchema[TReqest]['resType']
        : never;
    };
