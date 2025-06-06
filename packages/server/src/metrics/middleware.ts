import { RequestHandler } from 'express';
import { httpRequestCounter } from '.';
import { isPrometheusRequest } from './util';

export const metricsMiddleware: RequestHandler = async (req, res, next) => {
  if (await isPrometheusRequest(req)) {
    return next();
  }

  res.on('finish', () => {
    if (req.route && req.baseUrl !== undefined) {
      httpRequestCounter.inc({
        method: req.method,
        path: `${req.baseUrl}${req.route.path}`,
        authenticated: res.locals.sessionData?.steamId ? 'true' : 'false',
      });
    }
  });

  next();
};
