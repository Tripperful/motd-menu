CREATE TABLE IF NOT EXISTS
  client_connections (
    id uuid PRIMARY KEY,
    steam_id bigint NOT NULL,
    ip inet NOT NULL,
    port int NOT NULL,
    connected timestamp DEFAULT NOW(),
    disconnected timestamp,
    in_avg_latency float,
    in_avg_loss float,
    in_avg_choke float,
    in_avg_packets float,
    in_total_data float,
    out_avg_latency float,
    out_avg_loss float,
    out_avg_choke float,
    out_avg_packets float,
    out_total_data float
  );

CREATE TABLE IF NOT EXISTS
  client_names (
    id SERIAL PRIMARY KEY,
    steam_id bigint,
    name text,
    UNIQUE (steam_id, name)
  );

CREATE TABLE IF NOT EXISTS
  client_settings (
    steam_id bigint PRIMARY KEY,
    hit_sound boolean,
    kill_sound boolean,
    fov int,
    esp boolean,
    draw_viewmodel boolean
  );

CREATE TABLE IF NOT EXISTS
  client_aka (steam_id bigint PRIMARY KEY, name text);

CREATE TABLE IF NOT EXISTS
  matches (
    id uuid PRIMARY KEY,
    status text,
    demo_id text,
    duration float,
    map_id int REFERENCES maps (id),
    server_id int REFERENCES servers (id),
    initiator bigint,
    started timestamp,
    ended timestamp
  );

CREATE TABLE IF NOT EXISTS
  match_teams (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id),
    index smallint,
    name text,
    UNIQUE (match_id, index)
  );

CREATE TABLE IF NOT EXISTS
  match_team_players (
    id SERIAL PRIMARY KEY,
    match_team_id int REFERENCES match_teams (id),
    steam_id bigint,
    kills int,
    deaths int,
    UNIQUE (match_team_id, steam_id)
  );