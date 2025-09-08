import {
  chatColor,
  PlayerChatData,
  supportedLanguages,
} from '@motd-menu/common';
import { db } from 'src/db';
import { getPlayerProfile } from 'src/steam';
import { SrcdsWsApiClient } from 'src/ws/servers/srcds/SrcdsWsApiClient';

const yandexTranslateApiKey = process.env.YANDEX_TRANSLATE_API_KEY;
const provideHintLanguages = false;

const detect = async (text: string, languageCodeHints?: string[]) => {
  const res = await fetch(
    'https://translate.api.cloud.yandex.net/translate/v2/detect',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${yandexTranslateApiKey}`,
      },
      body: JSON.stringify({
        text,
        languageCodeHints,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Yandex Translate detect error: ${res.statusText}`);
  }

  const data = await res.json() as {languageCode: string;};
  return data.languageCode;
};

const translate = async (text: string, sourceLanguageCode: string, targetLanguageCode: string) => {
  const res = await fetch(
    'https://translate.api.cloud.yandex.net/translate/v2/translate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${yandexTranslateApiKey}`,
      },
      body: JSON.stringify({
        sourceLanguageCode,
        targetLanguageCode,
        texts: [text],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Yandex Translate translate error: ${res.statusText}`);
  }

  const data = await res.json() as { translations: { text: string; }[] };
  return data.translations[0].text;
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

  const authorLanguages = provideHintLanguages ? await db.chat.getPreferredLanguages(steamId) : [];
  const detectedLanguage = await detect(msg, authorLanguages);

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
      const translation = await translate(msg, detectedLanguage, mainLanguage);
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
