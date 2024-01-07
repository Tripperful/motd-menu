CREATE TABLE IF NOT EXISTS
  reactions (id SERIAL PRIMARY KEY, name varchar(256) UNIQUE);

CREATE TABLE IF NOT EXISTS
  maps_reactions (
    id SERIAL PRIMARY KEY,
    map_id int REFERENCES maps (id) ON DELETE CASCADE NOT NULL,
    reaction_id int REFERENCES reactions (id) ON DELETE CASCADE NOT NULL,
    steam_id bigint NOT NULL,
    UNIQUE (map_id, reaction_id, steam_id)
  );

CREATE TABLE IF NOT EXISTS
  maps_reviews_reactions (
    id SERIAL PRIMARY KEY,
    map_review_id int REFERENCES maps_reviews (id) ON DELETE CASCADE NOT NULL,
    reaction_id int REFERENCES reactions (id) ON DELETE CASCADE NOT NULL,
    steam_id bigint NOT NULL,
    UNIQUE (map_review_id, reaction_id, steam_id)
  );