import { Client, QueryResult } from 'pg';
import { config } from '~root/config';

const sqlImportOrder = ['migrations', 'tables', 'functions'];

const getSqlFileOrder = (fileName: string) => {
  const order = sqlImportOrder.findIndex((postfix) =>
    fileName.toLowerCase().endsWith(postfix + '.sql'),
  );
  return order === -1 ? sqlImportOrder.length : order;
};

const sqlOrderCmp = (file1: string, file2: string) =>
  getSqlFileOrder(file1) - getSqlFileOrder(file2);

export class BasePgDatabase {
  private pg: Client;
  protected pgEscText: (arg: string) => string;
  protected pgJson: (arg: unknown) => string;
  protected pgRes: <TRes>(res: QueryResult<TRes>) => unknown;

  constructor() {
    const pg = new Client(config.db);
    this.pg = pg;

    this.pgEscText = (arg: string) => pg.escapeLiteral(arg);
    this.pgJson = (obj: unknown) => this.pgEscText(JSON.stringify(obj));
    this.pgRes = <TRes>(res: QueryResult<TRes>) =>
      Object.values(Object.values(res.rows)[0])[0];
  }

  async init() {
    await this.pg.connect();

    console.log('Connected to PostgreSQL, initializing database...');

    const sqlContext = require.context('.', true, /\.sql$/i, 'sync');
    const sqlScripts = sqlContext
      .keys()
      .sort(sqlOrderCmp)
      .map((sqlPath) => sqlContext(sqlPath).default as string);

    for (const sql of sqlScripts) {
      await this.pg.query(sql);
    }
  }

  private esc(arg: unknown) {
    switch (typeof arg) {
      case 'string':
        return this.pgEscText(arg);
      case 'object':
        return arg === null ? 'NULL' : this.pgJson(arg);

      case 'undefined':
      default:
        return String(arg);
    }
  }

  private escArgs(args: unknown[]) {
    return args?.map((arg) => this.esc(arg))?.join(', ') ?? '';
  }

  async call(procedureName: string, ...args: unknown[]) {
    const argS = this.escArgs(args);
    const sql = `CALL ${procedureName}(${argS})`;
    try {
      await this.pg.query(sql);
    } catch (e) {
      console.error(`SQL error calling ${sql}: `, e);
      throw e;
    }
  }

  async select<TResult = unknown>(functionName: string, ...args: unknown[]) {
    const argS = this.escArgs(args);
    const sql = `SELECT ${functionName}(${argS})`;
    try {
      return this.pgRes(await this.pg.query(sql)) as TResult;
    } catch (e) {
      console.error(`SQL error calling ${sql}: `, e);
      throw e;
    }
  }
}
