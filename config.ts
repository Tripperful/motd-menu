import { Config } from '@motd-menu/common';

export const config: Config = {
  port: 3000,
  rconPassword: '123123',
  rconKeepAlive: 60 * 10,
  db: {
    host: 'db',
    user: 'motd-menu',
    password: '123123',
  },
  rootAdmins: [
    '76561197960465565', // Tripperful
  ],
  steamWebApiKey: '',
};
