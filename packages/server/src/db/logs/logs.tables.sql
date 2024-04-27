CREATE TABLE IF NOT EXISTS
  logs (
    id SERIAL PRIMARY KEY,
    log_time timestamp NOT NULL DEFAULT NOW(),
    event_type text NOT NULL,
    actor_steam_id bigint,
    event_data json
  );