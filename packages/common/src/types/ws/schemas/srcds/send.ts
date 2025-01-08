import type { Cvar } from '../../../../cvars';
import type { ChatCommandInfo, OnlinePlayerInfo } from '../../../players';
import type { WsApiSchema } from '../WsApiSchema';
import type {
  ChangeLevelData,
  ChatPrintData,
  ClientCexecData,
  MatchStateData,
  MotdOpenData,
  RankUpdateData,
  RunCommandData,
  SetCvarData,
  SetCvarsResponseData,
  SetPlayerTeamData,
  SetSettingsData,
  StartMatchData,
} from './payloads';

export type SrcdsWsSendSchema = WsApiSchema<{
  motd_auth_request: {
    reqData: string;
    resType: 'motd_auth_response';
    resData: OnlinePlayerInfo;
  };
  get_maps_request: {
    resType: 'get_maps_response';
    resData: string[];
  };
  get_match_state_request: {
    resType: 'get_match_state_response';
    resData: MatchStateData;
  };
  get_players_request: {
    resType: 'get_players_response';
    resData: OnlinePlayerInfo[];
  };
  get_chat_commands_request: {
    resType: 'get_chat_commands_response';
    resData: ChatCommandInfo[];
  };
  run_command: {
    reqData: RunCommandData;
  };
  chat_print: {
    reqData: ChatPrintData;
  };
  set_player_team: {
    reqData: SetPlayerTeamData;
  };
  get_cvars_request: {
    reqData: Cvar[];
    resType: 'get_cvars_response';
    resData: SetCvarsResponseData;
  };
  set_cvar: {
    reqData: SetCvarData;
  };
  client_exec: {
    reqData: ClientCexecData;
  };
  rank_update: {
    reqData: RankUpdateData[];
  };
  changelevel: {
    reqData: ChangeLevelData;
  };
  start_match: {
    reqData: StartMatchData;
  };
  apply_settings: {
    reqData: SetSettingsData;
  };
  motd_open: {
    reqData: MotdOpenData;
  };
  motd_close: {
    reqData: string;
  };
}>;
