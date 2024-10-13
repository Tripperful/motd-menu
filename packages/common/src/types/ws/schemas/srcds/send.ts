import type { Cvar } from '../../../../cvars';
import type { OnlinePlayerInfo } from '../../../players';
import type { WsApiSchema } from '../WsApiSchema';
import type {
  ChangeLevelData,
  ChatPrintData,
  ClientCexecData,
  MotdOpenData,
  RankData,
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
  get_players_request: {
    resType: 'get_players_response';
    resData: OnlinePlayerInfo[];
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
  client_cexec: {
    reqData: ClientCexecData;
  };
  rank_update: {
    reqData: RankData[];
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
