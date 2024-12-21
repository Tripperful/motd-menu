import { useSessionData } from './useSessionData';

export const usePreferredVolume = () => {
  return useSessionData().volume;
};
