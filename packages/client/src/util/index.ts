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

export const playTimeFormat = (playtimeSec: number) => {
  if (!playtimeSec) return '0h';

  const hours = Math.floor(playtimeSec / 3600);
  const playtimeMin = Math.ceil(playtimeSec / 60 - hours * 60);

  return [hours ? hours + 'h' : null, playtimeMin ? playtimeMin + 'm' : null]
    .filter(Boolean)
    .join(' ');
};
