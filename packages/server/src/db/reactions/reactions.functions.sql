CREATE
OR REPLACE PROCEDURE reactions_init (all_reaction_names json) AS $$ BEGIN
INSERT INTO reactions(name)
VALUES (json_array_elements_text(reactions_init.all_reaction_names)) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION json_map_reaction (reaction maps_reactions) RETURNS json AS $$ BEGIN RETURN json_build_object(
    'steamId', json_map_reaction.reaction.steam_id::text,
    'name',
    (
      SELECT name
      FROM reactions
      WHERE reactions.id = json_map_reaction.reaction.reaction_id
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION map_reactions (map_name text) RETURNS json AS $$ BEGIN RETURN json_agg(json_map_reaction(maps_reactions))
FROM maps_reactions
WHERE maps_reactions.map_id = (
    SELECT id
    FROM maps
    WHERE maps.name = map_reactions.map_name
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION json_map_review_reaction (reaction maps_reviews_reactions) RETURNS json AS $$ BEGIN
RETURN json_build_object(
    'steamId', json_map_review_reaction.reaction.steam_id::text,
    'name',
    (
      SELECT name
      FROM reactions
      WHERE reactions.id = json_map_review_reaction.reaction.reaction_id
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION map_review_reactions (map_name text, review_author_steam_id text) RETURNS json AS $$ BEGIN
RETURN json_agg(json_map_review_reaction(maps_reviews_reactions))
FROM maps_reviews_reactions
WHERE maps_reviews_reactions.map_review_id = (
    SELECT id
    FROM maps_reviews
    WHERE maps_reviews.map_id = (
      SELECT id
      FROM maps
      WHERE maps.name = map_review_reactions.map_name
    ) AND maps_reviews.steam_id = map_review_reactions.review_author_steam_id::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE add_map_reaction (map_name text, steam_id text, reaction_name text) AS $$ BEGIN
INSERT INTO maps_reactions(map_id, reaction_id, steam_id)
VALUES (
    (
      SELECT maps.id
      FROM maps
      WHERE maps.name = add_map_reaction.map_name
      LIMIT 1
    ),
    (
      SELECT reactions.id
      FROM reactions
      WHERE reactions.name = add_map_reaction.reaction_name
      LIMIT 1
    ),
    add_map_reaction.steam_id::bigint
  ) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE delete_map_reaction (map_name text, steam_id text, reaction_name text) AS $$ BEGIN
DELETE FROM maps_reactions
WHERE 
  maps_reactions.map_id = (
    SELECT maps.id
    FROM maps
    WHERE maps.name = delete_map_reaction.map_name
    LIMIT 1
  )
  AND maps_reactions.reaction_id = (
    SELECT reactions.id
    FROM reactions
    WHERE reactions.name = delete_map_reaction.reaction_name
    LIMIT 1
  )
  AND maps_reactions.steam_id = delete_map_reaction.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE add_map_review_reaction (
  map_name text,
  review_author_steam_id text,
  steam_id text,
  reaction_name text
) AS $$ BEGIN
INSERT INTO maps_reviews_reactions(map_review_id, reaction_id, steam_id)
VALUES (
    (
      SELECT maps_reviews.id
      FROM maps_reviews
      WHERE maps_reviews.steam_id = add_map_review_reaction.review_author_steam_id::bigint
        AND maps_reviews.map_id = (
          SELECT maps.id
          FROM maps
          WHERE maps.name = add_map_review_reaction.map_name
          LIMIT 1
        )
      LIMIT 1
    ),
    (
      SELECT reactions.id
      FROM reactions
      WHERE reactions.name = add_map_review_reaction.reaction_name
      LIMIT 1
    ),
    add_map_review_reaction.steam_id::bigint
  ) ON CONFLICT DO NOTHING;
END; 
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE delete_map_review_reaction (
  map_name text,
  review_author_steam_id text,
  steam_id text,
  reaction_name text
) AS $$ BEGIN
DELETE FROM maps_reviews_reactions
WHERE
  maps_reviews_reactions.map_review_id = (
    SELECT maps_reviews.id
    FROM maps_reviews
    WHERE maps_reviews.steam_id = delete_map_review_reaction.review_author_steam_id::bigint
      AND maps_reviews.map_id = (
        SELECT maps.id
        FROM maps
        WHERE maps.name = delete_map_review_reaction.map_name
        LIMIT 1
      )
    LIMIT 1
  )
  AND maps_reviews_reactions.reaction_id = (
    SELECT reactions.id
    FROM reactions
    WHERE reactions.name = delete_map_review_reaction.reaction_name
    LIMIT 1
  )
  AND maps_reviews_reactions.steam_id = delete_map_review_reaction.steam_id::bigint;
END; 
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION json_news_reaction (reaction news_reactions) RETURNS json AS $$ BEGIN
RETURN json_build_object(
    'steamId', json_news_reaction.reaction.steam_id::text,
    'name',
    (
      SELECT name
      FROM reactions
      WHERE reactions.id = json_news_reaction.reaction.reaction_id
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_news_reactions (news_id uuid) RETURNS json AS $$ BEGIN
RETURN COALESCE(json_agg(json_news_reaction(news_reactions)), '[]'::json)
FROM news_reactions
WHERE news_reactions.news_id = get_news_reactions.news_id;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE add_news_reaction (news_id uuid, steam_id text, reaction_name text) AS $$ BEGIN
INSERT INTO news_reactions(news_id, reaction_id, steam_id)
VALUES (
    add_news_reaction.news_id,
    (
      SELECT reactions.id
      FROM reactions
      WHERE reactions.name = add_news_reaction.reaction_name
      LIMIT 1
    ),
    add_news_reaction.steam_id::bigint
  ) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE delete_news_reaction (news_id uuid, steam_id text, reaction_name text) AS $$ BEGIN
DELETE FROM news_reactions
WHERE
  news_reactions.news_id = delete_news_reaction.news_id
  AND news_reactions.reaction_id = (
    SELECT reactions.id
    FROM reactions
    WHERE reactions.name = delete_news_reaction.reaction_name
    LIMIT 1
  )
  AND news_reactions.steam_id = delete_news_reaction.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION json_news_comment_reaction (reaction news_comments_reactions) RETURNS json AS $$ BEGIN
RETURN json_build_object(
    'steamId', json_news_comment_reaction.reaction.steam_id::text,
    'name',
    (
      SELECT name
      FROM reactions
      WHERE reactions.id = json_news_comment_reaction.reaction.reaction_id
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_news_comment_reactions (news_comment_id uuid) RETURNS json AS $$ BEGIN
RETURN COALESCE(json_agg(json_news_comment_reaction(news_comments_reactions)), '[]'::json)
FROM news_comments_reactions
WHERE news_comments_reactions.news_comment_id = get_news_comment_reactions.news_comment_id;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE add_news_comment_reaction (
  news_comment_id uuid,
  steam_id text,
  reaction_name text
) AS $$ BEGIN
INSERT INTO news_comments_reactions(news_comment_id, reaction_id, steam_id)
VALUES (
    add_news_comment_reaction.news_comment_id,
    (
      SELECT reactions.id
      FROM reactions
      WHERE reactions.name = add_news_comment_reaction.reaction_name
      LIMIT 1
    ),
    add_news_comment_reaction.steam_id::bigint
  ) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE delete_news_comment_reaction (
  news_comment_id uuid,
  steam_id text,
  reaction_name text
) AS $$ BEGIN
DELETE FROM news_comments_reactions
WHERE
  news_comments_reactions.news_comment_id = delete_news_comment_reaction.news_comment_id
  AND news_comments_reactions.reaction_id = (
    SELECT reactions.id
    FROM reactions
    WHERE reactions.name = delete_news_comment_reaction.reaction_name
    LIMIT 1
  )
  AND news_comments_reactions.steam_id = delete_news_comment_reaction.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;