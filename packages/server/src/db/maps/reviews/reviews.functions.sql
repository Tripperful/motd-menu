CREATE OR REPLACE FUNCTION json_map_review (review maps_reviews) RETURNS json AS $$ BEGIN RETURN json_build_object(
    'rate',
    review.rate,
    'mapName',
    (
      SELECT name
      FROM maps
      WHERE maps.id = review.map_id
      LIMIT 1
    ), 'steamId', review.steam_id::text, 'comment', review.comment, 'timestamp', ROUND(
      EXTRACT(
        EPOCH
        FROM review.updated_on
      ) * 1000
    )
  );
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION map_reviews (map_name text) RETURNS json AS $$ BEGIN RETURN json_agg(json_map_review(maps_reviews))
FROM maps_reviews
WHERE maps_reviews.map_id = (
    SELECT id
    FROM maps
    WHERE maps.name = map_name
  );
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION map_reviews_by_author (steam_id text) RETURNS json AS $$ BEGIN RETURN json_agg(json_map_review(maps_reviews))
FROM maps_reviews
WHERE maps_reviews.steam_id = map_reviews_by_author.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION set_map_review (map_name text, review json) RETURNS bigint AS $$
DECLARE ts bigint;
BEGIN
INSERT INTO maps_reviews (map_id, steam_id, rate, comment)
VALUES (
    (
      SELECT maps.id
      FROM maps
      WHERE maps.name = map_name
      LIMIT 1
    ), (review->>'steamId')::bigint, (review->>'rate')::int, review->>'comment'
  ) ON CONFLICT (map_id, steam_id) DO
UPDATE
SET rate = EXCLUDED.rate,
  comment = EXCLUDED.comment,
  updated_on = NOW()
RETURNING EXTRACT(
    EPOCH
    FROM maps_reviews.updated_on
  ) * 1000 INTO ts;
RETURN ts;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE delete_map_review (map_name text, steam_id text) AS $$ BEGIN
DELETE FROM maps_reviews
WHERE maps_reviews.map_id = (
    SELECT maps.id
    FROM maps
    WHERE maps.name = map_name
  )
  AND maps_reviews.steam_id = delete_map_review.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;