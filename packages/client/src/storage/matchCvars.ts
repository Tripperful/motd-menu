import { Cvar, matchCvarDefaults } from '@motd-menu/common';

export const getStoredMatchCvar = (cvar: Cvar) => {
  const stored = localStorage.getItem('matchCvar.' + cvar);

  return stored ?? matchCvarDefaults[cvar];
};

export const storeMatchCvar = (cvar: Cvar, value: string) => {
  localStorage.setItem('matchCvar.' + cvar, value);
};
