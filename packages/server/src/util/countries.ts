import { CountryCode, countryNameByCode, GeoData } from '@motd-menu/common';
import geoip from 'geoip-lite';
import { db } from 'src/db';

const unknownGeo: GeoData = {
  country: 'Unknown Country',
  countryCode: 'XX' as CountryCode,
  city: 'Unknown City',
  full: 'Unknown City, Unknown Country',
};

export const getPlayerGeoData = async (steamId: string): Promise<GeoData> => {
  try {
    if (!steamId) return unknownGeo;

    const lastIp = await db.client.getLastIp(steamId);

    const geoData = geoip.lookup(lastIp);
    const city = geoData.city ?? 'Unknown City';
    const countryCode = (geoData.country ?? 'XX') as CountryCode;
    const country = countryNameByCode[countryCode] ?? 'Unknown Country';
    const full = [city, country].filter(Boolean).join(', ');

    return country ? { city, country, countryCode, full } : unknownGeo;
  } catch {
    return unknownGeo;
  }
};
