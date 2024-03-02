CREATE TABLE IF NOT EXISTS
  servers (
    id SERIAL PRIMARY KEY,
    name text,
    ip inet,
    port int,
    api_key text,
    blocked boolean
  );

CREATE TABLE IF NOT EXISTS
  dev_tokens (
    id SERIAL PRIMARY KEY,
    token text,
    steam_id bigint
  );