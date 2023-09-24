export interface Config {
  /**
   * Web server port.
   */
  port: number;

  /**
   * RCON password (should be the same for all used servers).
   */
  rconPassword: string;

  /**
   * For how long to keep the RCON connection alive after
   * its last use.
   *
   * The connection will be automatically
   * created when needed and destroyed after the specified
   * amount of time of not being used.
   *
   * Specified in seconds.
   */
  rconKeepAlive: number;

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
