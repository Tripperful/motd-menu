import { Client } from 'pg';
import { config } from '../../config';

const db = new Client(config.db);

db.connect().then(async () => {
  console.log('Dropping SQL schema...');

  await db.query(`DROP SCHEMA public CASCADE`);
  await db.query(`CREATE SCHEMA public`);

  console.log('Success');

  db.end();
});
