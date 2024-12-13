import { CountryCode } from '../util/countries';

export interface GeoData {
  city: string;
  country: string;
  countryCode: CountryCode;
  full: string;
}

export interface SteamPlayerData {
  steamId: string;
  name: string;
  avatar: string;
  geo?: GeoData;
}
