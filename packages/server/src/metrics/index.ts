import client from 'prom-client';

export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'authenticated'],
});

export const onlineServersGauge = new client.Gauge({
  name: 'online_servers',
  help: 'Number of online servers',
});

export const onlinePlayersGauge = new client.Gauge({
  name: 'online_players',
  help: 'Number of online players',
  labelNames: ['server'],
});

export const matchCounter = new client.Counter({
  name: 'matches_total',
  help: 'Total number of matches played',
  labelNames: ['map', 'status'],
});

export const wsMessagesCounter = new client.Counter({
  name: 'ws_messages_total',
  help: 'Total number of WebSocket messages sent and received',
  labelNames: ['direction', 'type', 'server'],
});
