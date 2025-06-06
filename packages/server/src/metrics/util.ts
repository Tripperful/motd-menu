import { promises as dns } from 'dns';
import { Request } from 'express';

let prometheusIp: string = null;

export const isPrometheusRequest = async (req: Request) => {
  if (!prometheusIp) {
    try {
      prometheusIp = (await dns.lookup('prometheus'))?.address ?? 'unknown';
    } catch {
      prometheusIp = 'unknown';
    }
  }

  return req.ip.replace('::ffff:', '') === prometheusIp;
};
