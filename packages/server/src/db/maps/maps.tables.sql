CREATE TABLE IF NOT EXISTS
  maps (
    id SERIAL PRIMARY KEY,
    name text UNIQUE,
    display_name text,
    description text
  );

CREATE TABLE IF NOT EXISTS
  maps_images (
    map_id int REFERENCES maps (id),
    image_url varchar(1024),
    index int,
    PRIMARY KEY (map_id, image_url)
  );

CREATE TABLE IF NOT EXISTS
  maps_tags (
    map_id int REFERENCES maps (id),
    tag varchar(64),
    PRIMARY KEY (map_id, tag)
  );

CREATE TABLE IF NOT EXISTS
  maps_favorites (
    map_id int REFERENCES maps (id),
    steam_id bigint,
    PRIMARY KEY (map_id, steam_id)
  );