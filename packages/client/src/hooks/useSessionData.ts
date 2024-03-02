import { useMemo } from 'react';
import { getCookies } from 'src/util';
import { SessionData } from '~types/session';

export const useSessionData = () => {
  return useMemo(() => {
    const cookies = getCookies();

    const sessionData: SessionData = {
      steamId: cookies.steamId ?? 'Unknown',
      permissions: cookies.permissions ? JSON.parse(cookies.permissions) : [],
    };

    if (cookies.userId) {
      sessionData.userId = Number(cookies.userId);
    }

    return sessionData;
  }, []);
};
