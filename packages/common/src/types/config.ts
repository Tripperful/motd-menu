export interface Config {
  /**
   * Web server port.
   */
  port: number;

  /**
   * Postgres database settings.
   *
   * @see https://node-postgres.com/apis/client
   */
  db: import('pg').ClientConfig;

  /**
   * A list of Steam IDs for root admins that have all
   * permissions and can assign permissions to other players.
   */
  rootAdmins?: string[];

  /**
   * Steam web API key.
   *
   * Required to fetch players names and avatars from Steam.
   */
  steamWebApiKey: string;
}

export type SrcdsProtocol = 'ws';
