export const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');

      try {
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
      } finally {
        textArea.remove();
      }
    }
  } catch {}
};

export const getCookies = () => {
  const cookies = document.cookie.split(';');

  const result: Record<string, string> = {};

  for (const cookie of cookies) {
    const [k, v] = cookie.split('=');

    result[k.trim()] = decodeURIComponent(v);
  }

  return result;
};

export const steamProfileLink = (steamId: string) =>
  `https://steamcommunity.com/profiles/${steamId}`;

const dFormat = Intl.DateTimeFormat(navigator.language, {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const dateFormat = (ts: number | string | Date) => {
  const d = new Date(ts);

  return dFormat.format(d);
};

type LocalStorageKey = 'favsOnly' | 'tagFilters';

const lsDefaults = {
  favsOnly: false as boolean,
  tagFilters: [] as string[],
} as const;

type StoredDefaultsType = typeof lsDefaults;

// Used to assert the completeness of lsDefaults.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validLsDefaults: Record<LocalStorageKey, unknown> = lsDefaults;

export const lsGet = <TKey extends LocalStorageKey>(
  key: TKey,
): StoredDefaultsType[TKey] => {
  const val = localStorage.getItem(key);

  return val ? JSON.parse(val) : lsDefaults[key];
};

export const lsSet = <TKey extends LocalStorageKey>(
  key: TKey,
  value: StoredDefaultsType[TKey],
) => {
  localStorage.setItem(key, JSON.stringify(value));
};
