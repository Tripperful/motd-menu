import { useSessionData } from './useSessionData';

export const useMySteamId = () => useSessionData()?.steamId;
