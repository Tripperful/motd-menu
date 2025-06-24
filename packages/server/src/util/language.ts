import { Translate } from '@google-cloud/translate/build/src/v2';
import { db } from 'src/db';

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
