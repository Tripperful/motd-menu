export interface ReactionData {
  steamId: string;
  name: ReactionName;
}

const gLottieLink = (uid: string) =>
  `https://fonts.gstatic.com/s/e/notoemoji/latest/${uid}/lottie.json`;

export const reactionsAnimDataSrc = {
  rofl: gLottieLink('1f923'),
  grin: gLottieLink('1f604'),
  ['warm-smile']: gLottieLink('263a_fe0f'),
  ['hug-face']: gLottieLink('1f917'),
  ['heart-face']: gLottieLink('1f970'),
  ['partying-face']: gLottieLink('1f973'),
  wink: gLottieLink('1f609'),
  drool: gLottieLink('1f924'),
  melting: gLottieLink('1fae0'),
  woozy: gLottieLink('1f974'),
  sad: gLottieLink('1f61e'),
  rage: gLottieLink('1f621'),
  ['loudly-crying']: gLottieLink('1f62d'),
  ['neutral-face']: gLottieLink('1f610'),
  ['thinking-face']: gLottieLink('1f914'),
  screaming: gLottieLink('1f631'),
  cursing: gLottieLink('1f92c'),
  ['mouth-open']: gLottieLink('1f62e'),
  vomit: gLottieLink('1f92e'),
  clown: gLottieLink('1f921'),
  skull: gLottieLink('1f480'),
  poop: gLottieLink('1f4a9'),
  heart: gLottieLink('2764_fe0f'),
  fire: gLottieLink('1f525'),
  collision: gLottieLink('1f4a5'),
} as const;

export type ReactionName = keyof typeof reactionsAnimDataSrc;

export const allReactionNames = Object.keys(
  reactionsAnimDataSrc,
) as ReactionName[];
