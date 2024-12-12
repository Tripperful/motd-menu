export interface GeoData {
  city: string;
  country: string;
  countryCode: string;
  full: string;
}

export interface SteamPlayerData {
  steamId: string;
  name: string;
  avatar: string;
  geo?: GeoData;
}
