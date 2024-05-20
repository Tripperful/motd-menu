CREATE TABLE IF NOT EXISTS
  servers (
    id SERIAL PRIMARY KEY,
    name text,
    ip inet,
    port int,
    api_key text,
    demos_url text,
    blocked boolean,
    is_dev boolean DEFAULT false
  );

CREATE TABLE IF NOT EXISTS
  dev_tokens (
    id SERIAL PRIMARY KEY,
    token text,
    steam_id bigint
  );