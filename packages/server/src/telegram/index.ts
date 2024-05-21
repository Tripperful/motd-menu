import { randomBytes } from 'crypto';
import { RequestHandler } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { getPlayerProfile } from 'src/steam';

interface JoinCodeInfo {
  steamId: string;
  code: string;
  generatedAt: number;
}

interface TelegramUserInfo {
  steamId: string;
  chatId: number;
}

export class TelegramService {
  private static instance: TelegramService;
  private static joinCodeLifetime = 1000 * 60 * 5;

  private bot: TelegramBot;
  private joinLinksBySteamId: Record<string, string> = {};
  private joinLinks: Record<string, JoinCodeInfo> = {};
  private users: Record<string, TelegramUserInfo> = {};

  constructor(botToken: string) {
    this.bot = new TelegramBot(botToken, { polling: true });
    this.bot.on('message', (msg) => this.onMessage(msg));

    TelegramService.instance = this;
  }

  public async sendMessage(chatId: number, message: string) {
    return await this.bot.sendMessage(chatId, message, {
      parse_mode: 'MarkdownV2',
    });
  }

  private async onMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;

    if (msg.text.startsWith('/start ')) {
      const code = msg.text.slice(7);

      const joinCode = this.joinLinks[code];

      if (!joinCode) {
        return await this.sendMessage(chatId, 'Invalid join link');
      }

      if (
        Date.now() - joinCode.generatedAt >
        TelegramService.joinCodeLifetime
      ) {
        return await this.sendMessage(chatId, 'Join link has expired');
      }

      delete this.joinLinks[code];
      const steamId = joinCode.steamId;

      this.users[steamId] = { steamId, chatId };

      const profile = await getPlayerProfile(steamId);

      return await this.sendMessage(chatId, `Welcome, ${profile.name}\\!`);
    }
  }

  public async getJoinLink(steamId: string) {
    const me = await this.bot.getMe();

    const code = randomBytes(16).toString('hex');

    if (this.joinLinksBySteamId[steamId]) {
      const oldCode = this.joinLinksBySteamId[steamId];

      delete this.joinLinksBySteamId[steamId];
      delete this.joinLinks[oldCode];
    }

    this.joinLinks[code] = {
      steamId,
      code,
      generatedAt: Date.now(),
    };

    this.joinLinksBySteamId[steamId] = code;

    return `https://t.me/${me.username}?start=${code}`;
  }

  public async stop() {
    await this.bot.stopPolling();
  }

  public static middleware: RequestHandler = async (req, res, next) => {
    res.locals.tgService = TelegramService.instance;

    next();
  };
}
