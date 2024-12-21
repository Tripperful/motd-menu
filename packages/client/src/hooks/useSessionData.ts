import { useMemo } from 'react';
import { getCookies } from 'src/util';
import { SessionData } from '~types/session';

export const getSessionData = () => {
  const cookies = getCookies();

  const sessionData: SessionData = {
    steamId: cookies.steamId ?? 'Unknown',
    permissions: cookies.permissions ? JSON.parse(cookies.permissions) : [],
    volume: cookies.volume ? Number(cookies.volume) : 1,
    // tgConnected: cookies.tgConnected === 'true',
  };

  if (cookies.userId) {
    sessionData.userId = Number(cookies.userId);
  }

  return sessionData;
};

export const useSessionData = () => {
  return useMemo(getSessionData, []);
};
