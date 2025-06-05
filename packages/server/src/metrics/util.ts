import { promises as dns } from 'dns';
import { Request } from 'express';

let prometheusIp: string = null;

export const isPrometheusRequest = async (req: Request) => {
  if (!prometheusIp) {
    prometheusIp = (await dns.lookup('prometheus')).address;
  }

  return req.ip.replace('::ffff:', '') === prometheusIp;
};
