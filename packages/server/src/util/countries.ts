import { CountryCode, countryNameByCode, GeoData } from '@motd-menu/common';
import geoip from 'geoip-lite';
import { db } from 'src/db';

const unknownGeo: GeoData = {
  country: 'Unknown Country',
  countryCode: 'XX',
  city: 'Unknown City',
  full: 'Unknown City, Unknown Country',
};

export const getGeoDataByIp = async (ip: string): Promise<GeoData> => {
  try {
    const geoData = geoip.lookup(ip);

    const city = geoData?.city ?? unknownGeo.city;
    const countryCode =
      (geoData?.country as CountryCode) ?? unknownGeo.countryCode;
    const country = countryNameByCode[countryCode] ?? unknownGeo.country;
    const full = [city, country].filter(Boolean).join(', ');

    return { city, country, countryCode, full };
  } catch {
    return unknownGeo;
  }
};

export const getGeoDataBySteamId = async (steamId: string): Promise<GeoData> => {
  const lastIp = await db.client.getLastIp(steamId);

  return lastIp ? await getGeoDataByIp(lastIp) : unknownGeo;
};
