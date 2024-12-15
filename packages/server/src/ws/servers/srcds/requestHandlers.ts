import { db } from 'src/db';
import { getPlayerGeoData } from 'src/util/countries';
import { SrcdsWsApiServer } from './SrcdsWsApiServer';

const srcdsWsServer = SrcdsWsApiServer.getInstace();

srcdsWsServer.onRequest('get_smurfs_request', async (srcds, data) => ({
  type: 'get_smurfs_response',
  data: await db.client.getSmurfSteamIds(data),
}));

srcdsWsServer.onRequest('get_names_request', async (srcds, data) => ({
  type: 'get_names_response',
  data: await db.client.getNames(data),
}));

srcdsWsServer.onRequest('get_settings_request', async (srcds, data) => {
  const {
    fov,
    magnumZoomFov,
    crossbowZoomFov,
    drawViewmodel,
    esp,
    dsp,
    hitSound,
    killSound,
    kevlarSound,
  } = await db.client.settings.get(data);

  const aka = (await db.client.getAka(data)) ?? '';

  return {
    type: 'get_settings_response',
    data: {
      fov,
      magnumZoomFov,
      crossbowZoomFov,
      drawviewmodel: drawViewmodel ? 1 : 0,
      esp: esp ? 1 : 0,
      dsp: dsp ? 1 : 0,
      hitsound: hitSound ? 1 : 0,
      killsound: killSound ? 1 : 0,
      kevlarsound: kevlarSound ? 1 : 0,
      aka,
      geo: (await getPlayerGeoData(data))?.country ?? '',
    },
  };
});
