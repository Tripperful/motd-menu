CREATE TABLE IF NOT EXISTS
  permissions (id SERIAL PRIMARY KEY, code varchar(64) UNIQUE);

CREATE TABLE IF NOT EXISTS
  players_permissions (
    steam_id bigint,
    permission_id int REFERENCES permissions (id),
    PRIMARY KEY (steam_id, permission_id)
  );