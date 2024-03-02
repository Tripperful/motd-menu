import dotenv from 'dotenv';
import path from 'path';

if (!process.env.MOTD_WEB_PORT) {
  dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
  });
}
