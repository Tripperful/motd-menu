import { Router } from "express";
import client from 'prom-client';

export const metricsRouter = Router();

client.collectDefaultMetrics();

metricsRouter.get('/', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});