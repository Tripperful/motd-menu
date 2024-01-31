import { uuid } from 'src/util';
import { wsApi } from '.';

export const onWsConnectionDummy = (remoteId: string) => {
  wsApi.request(remoteId, 'get_maps_request');
  wsApi.request(remoteId, 'get_cvars_request', ['sv_cheats', 'mp_teamplay']);
  wsApi.request(remoteId, 'get_players_request');
  wsApi.request(remoteId, 'motd_auth_request', uuid());

  wsApi.send(remoteId, 'set_cvar', {
    cvar: 'sv_cheats',
    value: '1',
  });
  wsApi.send(remoteId, 'set_player_team', {
    userId: 1,
    teamIndex: 2,
  });
  wsApi.send(remoteId, 'changelevel', {
    token: uuid(),
    mapName: 'dm_ethic',
  });
  wsApi.send(remoteId, 'start_match', {
    token: uuid(),
    preTimerCommands: 'c3ZfY2hlYXRzIDE=',
    postTimerCommands: 'c3ZfY2hlYXRzIDA=',
  });
  wsApi.send(remoteId, 'motd_close', uuid());

  wsApi.send(
    remoteId,
    'get_settings_response',
    {
      drawviewmodel: 1,
      esp: 0,
      fov: 90,
      hitsound: 1,
      killsound: 1,
    },
    uuid(),
  );
  wsApi.send(
    remoteId,
    'get_smurfs_response',
    ['76561197960465565', '76561197990543972'],
    uuid(),
  );
  wsApi.send(remoteId, 'get_names_response', ['name 1', 'name 2'], uuid());
};
