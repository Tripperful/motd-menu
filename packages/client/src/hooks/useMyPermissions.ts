import { useSessionData } from './useSessionData';

export const useMyPermissions = () => useSessionData()?.permissions;
