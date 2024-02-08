import { Config } from '@motd-menu/common';
import dotenv from 'dotenv';
import path from 'path';

if (!process.env.MOTD_WEB_PORT) {
  dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
  });
}

export const config: Config = {
  port: Number(process.env.MOTD_WEB_PORT),
  db: {
    host: '0.0.0.0',
    user: 'motd-menu',
    password: '123123',
  },
  rootAdmins: process.env.MOTD_ROOT_ADMINS.split(',').map((v) => v.trim()),
  steamWebApiKey: process.env.MOTD_STEAM_API_KEY,
};
