import { useMemo } from 'react';
import { getCookies } from 'src/util';
import { SessionData } from '~types/session';

export const useSessionData = () => {
  return useMemo(() => {
    const cookies = getCookies();

    return {
      name: cookies.name ?? 'Unknown',
      permissions: cookies.permissions ? JSON.parse(cookies.permissions) : [],
      steamId: cookies.steamId ?? 'Unknown',
      userId: Number(cookies.userId ?? -1),
    } as SessionData;
  }, []);
};
