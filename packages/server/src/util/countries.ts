import { CountryCode, countryNameByCode, GeoData } from '@motd-menu/common';
import geoip from 'geoip-lite';
import { db } from 'src/db';

const unknownGeo: GeoData = {
  country: 'Unknown Country',
  countryCode: 'XX',
  city: 'Unknown City',
  full: 'Unknown City, Unknown Country',
};

const steamP2pGeo: GeoData = {
  country: 'Steam P2P',
  countryCode: 'P2P',
  city: '',
  full: 'Steam P2P',
};

export const getGeoDataByIp = async (ip: string): Promise<GeoData> => {
  if (ip.startsWith('169.254.')) {
    return steamP2pGeo;
  }

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

export const getGeoDataBySteamId = async (
  steamId: string,
): Promise<GeoData> => {
  const lastIp = await db.client.getLastIp(steamId);

  return lastIp ? await getGeoDataByIp(lastIp) : unknownGeo;
};
