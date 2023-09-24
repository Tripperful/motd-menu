import { RCON } from '@fabricio-191/valve-server-query';
import { config } from '~root/config';

export interface RconApi {
  exec(cmd: string): Promise<string>;
}

export class SrcdsRcon implements RconApi {
  private rcon: RCON;
  private destroyTimeout: ReturnType<typeof setTimeout>;

  constructor(
    private ip: string,
    private port: number,
    private password: string,
  ) {}

  private get prefix() {
    return `RCON [${this.ip}:${this.port}]`;
  }

  private async connect() {
    console.info(`${this.prefix} - connecting...`);

    try {
      this.rcon = await RCON({
        ip: this.ip,
        port: this.port,
        password: this.password,
      });

      console.info(`${this.prefix} - connected`);

      this.rcon.on('disconnect', (reason) => {
        console.warn(`${this.prefix} - disconnected: ${reason}`);

        delete this.rcon;
      });
    } catch (error) {
      console.error(`${this.prefix} - failed to connect: ${error}`);

      delete this.rcon;
    }
  }

  async exec(cmd: string) {
    try {
      if (!this.rcon) {
        await this.connect();
      }

      if (this.destroyTimeout) {
        clearTimeout(this.destroyTimeout);

        this.destroyTimeout = setTimeout(() => {
          this.rcon?.destroy();
        }, config.rconKeepAlive * 1000);
      }

      return await this.rcon.exec(cmd);
    } catch (error) {
      throw `${this.prefix} - failed to execute command: ${cmd}\nreason: ${error}`;
    }
  }
}
