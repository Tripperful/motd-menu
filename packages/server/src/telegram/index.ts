import { randomBytes } from 'crypto';
import { RequestHandler } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { db } from 'src/db';
import { getPlayerProfile } from 'src/steam';
import { TelegramClientInfo } from './types';

interface JoinCodeInfo {
  steamId: string;
  code: string;
  generatedAt: number;
}

export class TelegramService {
  private static joinCodeLifetime = 1000 * 60 * 5;

  private bot: TelegramBot;
  private joinLinksBySteamId: Record<string, string> = {};
  private joinLinks: Record<string, JoinCodeInfo> = {};

  constructor(botToken: string) {
    if (this.bot) {
      this.bot.stopPolling();
      this.bot.removeAllListeners();
    }

    this.bot = new TelegramBot(botToken, { polling: true });
    this.bot.setMyCommands([
      {
        command: 'stop',
        description:
          'Disconnect your account from the bot and stop receiving messages',
      },
      {
        command: 'online',
        description: 'Show online servers and players',
      },
    ]);

    this.bot.on('message', (msg) => this.onMessage(msg));

    TelegramService._instance = this;
  }

  private static _instance: TelegramService = null;
  public static get instance() {
    return TelegramService._instance;
  }

  private async onUnauthorized(msg: TelegramBot.Message) {
    return await this.bot.sendMessage(
      msg.chat.id,
      'You need to authenticate via the in-game menu first to use this bot',
    );
  }

  private async onMessage(msg: TelegramBot.Message) {
    const clientInfo = await db.telegram.getClientByClientId(msg.from.id);

    if (msg.text?.startsWith('/')) {
      return await this.onCommand(msg, clientInfo);
    }

    if (!clientInfo) {
      await this.onUnauthorized(msg);
    }
  }

  private async onCommand(
    msg: TelegramBot.Message,
    clientInfo: TelegramClientInfo,
  ) {
    const cmd = msg.text.slice(1).split(' ')[0];
    const args = msg.text.slice(1).split(' ').slice(1);

    if (cmd === 'start') {
      return await this.onStarted(args[0], msg);
    }

    if (!clientInfo) {
      return await this.onUnauthorized(msg);
    }

    switch (cmd) {
      case 'stop':
        return await this.onStopped(msg);
    }
  }

  private async onStarted(code: string, msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const joinCode = this.joinLinks[code];

    if (!joinCode) {
      return await this.bot.sendMessage(chatId, 'Invalid join link');
    }

    if (Date.now() - joinCode.generatedAt > TelegramService.joinCodeLifetime) {
      return await this.bot.sendMessage(chatId, 'Join link has expired');
    }

    delete this.joinLinks[code];
    const steamId = joinCode.steamId;

    const clientId = msg.from.id;
    await db.telegram.linkClient(steamId, clientId, chatId);

    const profile = await getPlayerProfile(steamId);

    return await this.bot.sendMessage(chatId, `Welcome, ${profile.name}!`);
  }

  private async onStopped(msg: TelegramBot.Message) {
    const clientInfo = await db.telegram.getClientByClientId(msg.from.id);

    if (!clientInfo) {
      return await this.bot.sendMessage(msg.chat.id, 'You are not connected');
    }

    await db.telegram.unlinkClient(clientInfo.steamId);

    return await this.bot.sendMessage(
      msg.chat.id,
      'You will no longer receive messages from us',
    );
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

  public static middleware: RequestHandler = async (_req, res, next) => {
    res.locals.tgService = TelegramService.instance;
    res.locals.tgClientInfo = await db.telegram.getClientBySteamId(
      res.locals.sessionData.steamId,
    );

    res.cookie('tgConnected', !!res.locals.tgClientInfo?.clientId);

    next();
  };
}
