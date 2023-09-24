import { Database } from './Database';
import { PgDatabase } from './PgDatabase';

export const db: Database = new PgDatabase();
