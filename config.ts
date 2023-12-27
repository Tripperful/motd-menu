import { Config } from '@motd-menu/common';

export const config: Config = {
  port: Number(process.env.MOTD_WEB_PORT),
  rconPassword: process.env.MOTD_RCON_PASSWORD,
  rconKeepAlive: 60 * 10,
  db: {
    host: '0.0.0.0',
    user: 'motd-menu',
    password: '123123',
  },
  rootAdmins: process.env.MOTD_ROOT_ADMINS.split(',').map((v) => v.trim()),
  steamWebApiKey: process.env.MOTD_STEAM_API_KEY,
};
