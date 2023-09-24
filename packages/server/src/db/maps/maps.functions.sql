CREATE OR REPLACE PROCEDURE maps_init (maps json) AS $$ BEGIN
INSERT INTO maps(name)
VALUES (json_array_elements_text(maps)) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION maps_previews (steam_id text) RETURNS json AS $$ BEGIN RETURN json_agg(
    json_build_object(
      'id',
      maps.id,
      'name',
      maps.name,
      'image',
      (
        SELECT maps_images.image_url
        FROM maps_images
        WHERE maps_images.map_id = maps.id
        ORDER BY maps_images.index
        LIMIT 1
      ), 'tags', ARRAY(
        SELECT tag
        FROM maps_tags mt1
        WHERE mt1.map_id = maps.id
        ORDER BY (
            SELECT COUNT(*)
            FROM maps_tags mt2
            WHERE mt1.tag = mt2.tag
          ) DESC,
          tag ASC
      ),
      'rate',
      (
        SELECT AVG(maps_reviews.rate)
        FROM maps_reviews
        WHERE maps_reviews.map_id = maps.id
      ),
      'isFavorite',
      EXISTS(
        SELECT *
        FROM maps_favorites
        WHERE maps_favorites.map_id = maps.id
          AND maps_favorites.steam_id = maps_previews.steam_id::bigint
        LIMIT 1
      )
    )
    ORDER BY maps.name ASC
  )
FROM maps;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION map_details (map_name text, steam_id text) RETURNS json AS $$ BEGIN RETURN json_build_object(
    'id',
    maps.id,
    'name',
    maps.name,
    'description',
    maps.description,
    'images',
    ARRAY(
      SELECT image_url
      FROM maps_images
      WHERE maps_images.map_id = maps.id
      ORDER BY maps_images.index
    ),
    'tags',
    ARRAY(
      SELECT tag
      FROM maps_tags mt1
      WHERE mt1.map_id = maps.id
      ORDER BY (
          SELECT COUNT(*)
          FROM maps_tags mt2
          WHERE mt1.tag = mt2.tag
        ) DESC,
        tag ASC
    ),
    'isFavorite',
    EXISTS(
      SELECT *
      FROM maps_favorites
      WHERE maps_favorites.map_id = maps.id
        AND maps_favorites.steam_id = map_details.steam_id::bigint
      LIMIT 1
    )
  )
FROM maps
WHERE maps.name = map_name;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE map_set_description (map_name text, info json) AS $$ BEGIN
UPDATE maps
SET description = map_set_description.info->>'description'
WHERE name = map_set_description.map_name;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE map_set_images (map_name text, images json) AS $$ BEGIN
DELETE from maps_images
WHERE maps_images.map_id = (
    SELECT id
    FROM maps
    WHERE maps.name = map_set_images.map_name
    LIMIT 1
  );
INSERT INTO maps_images(map_id, image_url, index)
SELECT maps.id,
  VALUE,
  ordinality
FROM maps,
  json_array_elements_text(images) WITH ordinality
WHERE maps.name = map_set_images.map_name ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE map_set_tags (map_name text, tags json) AS $$
DECLARE temp_map_id int;
BEGIN
SELECT id INTO temp_map_id
FROM maps
WHERE maps.name = map_set_tags.map_name
LIMIT 1;
DELETE from maps_tags
WHERE maps_tags.map_id = temp_map_id;
INSERT INTO maps_tags(map_id, tag)
VALUES(temp_map_id, json_array_elements_text(tags)) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE map_set_favorite (map_name text, steam_id text, favorite boolean) AS $$
DECLARE temp_map_id int;
BEGIN
SELECT id INTO temp_map_id
FROM maps
WHERE maps.name = map_set_favorite.map_name
LIMIT 1;
IF favorite THEN
INSERT INTO maps_favorites (map_id, steam_id)
VALUES(temp_map_id, map_set_favorite.steam_id::bigint);
ELSE
DELETE FROM maps_favorites
WHERE maps_favorites.map_id = temp_map_id
  AND maps_favorites.steam_id = map_set_favorite.steam_id::bigint;
END IF;
END;
$$ LANGUAGE plpgsql;