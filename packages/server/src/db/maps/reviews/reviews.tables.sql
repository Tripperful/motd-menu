CREATE TABLE IF NOT EXISTS maps_reviews (
  map_id int REFERENCES maps (id),
  steam_id bigint,
  rate int,
  comment varchar(256),
  updated_on timestamp DEFAULT NOW(),
  PRIMARY KEY (map_id, steam_id)
);