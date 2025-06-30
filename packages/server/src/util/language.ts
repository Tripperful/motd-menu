import { Translate } from '@google-cloud/translate/build/src/v2';
import {
  chatColor,
  PlayerChatData,
  supportedLanguages,
} from '@motd-menu/common';
import { db } from 'src/db';
import { getPlayerProfile } from 'src/steam';
import { SrcdsWsApiClient } from 'src/ws/servers/srcds/SrcdsWsApiClient';

let translator: Translate;
export const getTranslator = () => {
  if (!translator) {
    const keyfileBase64 = process.env.GOOGLE_TRANSLATE_KEYFILE_BASE64;

    if (!keyfileBase64) return null;

    const credentials = JSON.parse(
      Buffer.from(keyfileBase64, 'base64').toString('utf-8'),
    );

    translator = new Translate({
      credentials,
    });
  }

  return translator;
};

export const initPreferredLanguages = async (
  steamId: string,
  languages: string[],
) => {
  const langs = await db.chat.getPreferredLanguages(steamId);
  if (langs.length === 0) {
    await db.chat.setPreferredLanguages(steamId, languages);
  }
};

export const translateMessageForPlayers = async (
  srcds: SrcdsWsApiClient,
  data: PlayerChatData,
) => {
  const { steamId, msg, teamIdx, teamOnly } = data;
  if (msg.startsWith('!') || msg.startsWith('@')) return;

  const translator = getTranslator();
  if (!translator) return;

  const players = await srcds.request('get_players_request');

  const playersLanguages: Record<string, string[]> = {};

  await Promise.all(
    players
      .filter((p) => {
        if (p.steamId === steamId) return false;
        if (teamOnly && p.teamIdx !== teamIdx && p.teamIdx !== 1) return false;
        return true;
      })
      .map(async (player) => {
        const [settings, languages] = await Promise.all([
          db.client.settings.getValues(player.steamId),
          db.chat.getPreferredLanguages(player.steamId),
        ]);

        if (settings?.translateChat && languages?.length > 0) {
          playersLanguages[player.steamId] = languages;
        }
      }),
  );

  if (Object.keys(playersLanguages).length === 0) return;

  const [{ language: detectedLanguage }] = await translator.detect(msg);

  if (!supportedLanguages[detectedLanguage]) return;

  const targetTranslations = new Set<string>();

  for (const [, languages] of Object.entries(playersLanguages)) {
    if (!languages.includes(detectedLanguage)) {
      targetTranslations.add(languages[0]);
    }
  }

  const translationsByLanguage: Record<string, string> = {};

  await Promise.all(
    Array.from(targetTranslations).map(async (mainLanguage) => {
      const [translation] = await translator.translate(msg, mainLanguage);
      translationsByLanguage[mainLanguage] = translation;
    }),
  );

  if (Object.keys(translationsByLanguage).length === 0) return;

  const sender = await getPlayerProfile(steamId);

  for (const [language, translation] of Object.entries(
    translationsByLanguage,
  )) {
    const clients = Object.keys(playersLanguages).filter(
      (steamId) =>
        playersLanguages[steamId][0] === language &&
        !playersLanguages[steamId].includes(detectedLanguage),
    );

    if (clients.length === 0) continue;

    srcds.send('chat_print', {
      clients,
      text: `${chatColor.MOTD}[${detectedLanguage.toUpperCase()} ➔ ${language.toUpperCase()}] ${chatColor.Yellow}${sender.name}: ${chatColor.White}${translation}`,
    });
  }
};
