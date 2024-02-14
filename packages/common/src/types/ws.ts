export type WsMessageType =
  | 'get_maps_request'
  | 'get_maps_response'
  | 'set_cvar'
  | 'get_settings_request'
  | 'set_settings'
  | 'get_settings_response'
  | 'set_player_team'
  | 'get_cvars_response'
  | 'get_cvars_request'
  | 'get_smurfs_request'
  | 'get_smurfs_response'
  | 'player_connected'
  | 'changelevel'
  | 'get_players_request'
  | 'get_players_response'
  | 'get_names_request'
  | 'get_names_response'
  | 'player_disconnected'
  | 'start_match'
  | 'motd_auth_request'
  | 'motd_auth_response'
  | 'apply_settings'
  | 'motd_close';

export interface WsMessage<TData = unknown> {
  type: WsMessageType;
  guid?: string;
  data?: TData;
}

export type WsMessageCallback<TData = unknown> = (
  msg: WsMessage<TData>,
) => void;

export type WsSubscriberCallback<TData = unknown> = (
  msg: WsMessage<TData>,
) => Promise<WsMessage | void> | void;

export interface PlayerConnectedReqest {
  token: string;
  steamId: string;
  ip: string;
  port: number;
}

interface ConnectionStats {
  avgchoke: number;
  avglatency: number;
  avgloss: number;
  avgpackets: number;
  totaldata: number;
}

export interface PlayerDisconnectedReqest {
  token: string;
  connectionStats: {
    in: ConnectionStats;
    out: ConnectionStats;
  };
}

export interface SetSettingsAction {
  steamId: string;
  settings: {
    drawviewmodel: 0 | 1;
    esp: 0 | 1;
    fov: number;
    hitsound: 0 | 1;
    killsound: 0 | 1;
  };
}
