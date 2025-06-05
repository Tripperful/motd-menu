import { RequestHandler } from 'express';
import { httpRequestCounter } from '.';
import { isPrometheusRequest } from './util';

export const metricsMiddleware: RequestHandler = async (req, res, next) => {
  if (await isPrometheusRequest(req)) {
    return next();
  }

  httpRequestCounter.inc({
    method: req.method,
    path: req.path,
    authenticated: res.locals.sessionData?.steamId ? 'true' : 'false',
  });

  next();
};
