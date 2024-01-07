CREATE TABLE IF NOT EXISTS
  maps_reviews (
    id SERIAL PRIMARY KEY,
    map_id int REFERENCES maps (id),
    steam_id bigint,
    rate int,
    comment varchar(256),
    updated_on timestamp DEFAULT NOW(),
    UNIQUE (map_id, steam_id)
  );