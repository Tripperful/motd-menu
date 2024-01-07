import { SteamPlayerData } from './steam';

export interface ReactionData {
  steamId: string;
  name: ReactionName;
  author?: SteamPlayerData;
}

export const reactionsAnimDataSrc = {
  rofl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f923/lottie.json',
  grin: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f604/lottie.json',
  ['warm-smile']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/263a_fe0f/lottie.json',
  ['hug-face']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f917/lottie.json',
  ['heart-face']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/lottie.json',
  ['partying-face']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/lottie.json',
  wink: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f609/lottie.json',
  drool: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f924/lottie.json',
  melting: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/lottie.json',
  woozy: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f974/lottie.json',
  sad: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f61e/lottie.json',
  rage: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/lottie.json',
  ['loudly-crying']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/lottie.json',
  ['neutral-face']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f610/lottie.json',
  ['thinking-face']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/lottie.json',
  screaming: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f631/lottie.json',
  cursing: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92c/lottie.json',
  ['mouth-open']:
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62e/lottie.json',
  vomit: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92e/lottie.json',
  clown: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f921/lottie.json',
  skull: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f480/lottie.json',
  poop: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a9/lottie.json',
  heart: 'https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f/lottie.json',
  fire: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/lottie.json',
  collision: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a5/lottie.json',
} as const;

export type ReactionName = keyof typeof reactionsAnimDataSrc;

export const allReactionNames = Object.keys(
  reactionsAnimDataSrc,
) as ReactionName[];
