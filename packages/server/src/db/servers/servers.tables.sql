CREATE TABLE IF NOT EXISTS
  servers (
    id SERIAL PRIMARY KEY,
    name text,
    ip inet,
    port int,
    api_key text,
    blocked boolean
  );