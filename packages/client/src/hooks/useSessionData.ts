import { useMemo } from 'react';
import { getCookies } from 'src/util';
import { SessionData } from '~types/session';

export const getSessionData = () => {
  const cookies = getCookies();

  const sessionData: SessionData = {
    steamId: cookies.steamId ?? 'Unknown',
    permissions: cookies.permissions ? JSON.parse(cookies.permissions) : [],
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
