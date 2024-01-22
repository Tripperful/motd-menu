const steamId64Ident = BigInt('76561197960265728');

export const accountNumberToSteamId64 = (uSteamId: string) => {
  return (BigInt(uSteamId) + steamId64Ident).toString();
};

export const steamId64ToAccountNumber = (steamId64: string) => {
  return (BigInt(steamId64) - steamId64Ident).toString();
};

export const steamId64ToLegacy = (steamId64: string) => {
  const accountNumber = BigInt(steamId64ToAccountNumber(steamId64));

  return `STEAM_0:${accountNumber & BigInt(1)}:${accountNumber >> BigInt(1)}`;
};
