CREATE
OR REPLACE FUNCTION can_view_all_news (steam_id bigint) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT *
    FROM players_permissions
    WHERE players_permissions.steam_id = can_view_all_news.steam_id
      AND players_permissions.permission_id IN (
        SELECT id
        FROM permissions
        WHERE code = 'news_create' OR code = 'news_publish'
      )
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION news_preview_json (_news record) RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'id', _news.id,
    'authorSteamId', _news.author_steam_id::text,
    'title', _news.title,
    'createdOn', ROUND(EXTRACT(EPOCH FROM _news.created_on) * 1000),
    'publishedOn', ROUND(EXTRACT(EPOCH FROM  _news.published_on) * 1000),
    'readOn', ROUND(EXTRACT(EPOCH FROM  _news.read_on) * 1000)
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION news_json (_news record) RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'id', _news.id,
    'authorSteamId', _news.author_steam_id::text,
    'title', _news.title,
    'content', _news.content,
    'createdOn', ROUND(EXTRACT(EPOCH FROM _news.created_on) * 1000),
    'publishedOn', ROUND(EXTRACT(EPOCH FROM _news.published_on) * 1000),
    'readOn', ROUND(EXTRACT(EPOCH FROM _news.read_on) * 1000),
    'hiddenOn', ROUND(EXTRACT(EPOCH FROM _news.hidden_on) * 1000)
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_player_news_previews (
  steam_id text,
  lmt integer,
  ofst integer,
  search_text text
) RETURNS json AS $$
BEGIN
  RETURN (
    WITH _found_news AS (
      SELECT *
      FROM news n
      LEFT JOIN news_read r
        ON r.news_id = n.id
        AND r.steam_id = get_player_news_previews.steam_id::bigint
      WHERE (
        (
          (
            n.published_on IS NOT NULL
            AND r.hidden_on IS NULL
          ) OR can_view_all_news(get_player_news_previews.steam_id::bigint)
          OR n.author_steam_id = get_player_news_previews.steam_id::bigint
        ) AND (
          search_text IS NULL
          OR n.title ILIKE '%' || get_player_news_previews.search_text || '%'
          OR n.content ILIKE '%' || get_player_news_previews.search_text || '%'
        )
      )
      ORDER BY
        n.published_on IS NULL DESC,
        r.read_on IS NULL DESC,
        n.published_on DESC,
        n.created_on DESC

    ) SELECT json_build_object(
      'total',
      (SELECT COUNT(*) FROM _found_news),
      'unread',
      (
        SELECT COUNT(*)
        FROM _found_news
        WHERE NOT EXISTS(
          SELECT *
          FROM news_read
          WHERE news_read.news_id = _found_news.id
            AND news_read.steam_id = get_player_news_previews.steam_id::bigint
        )
      ),
      'data',
      (
        SELECT COALESCE(json_agg(news_preview_json(_news_page)), '[]'::json)
        FROM (
          SELECT * FROM _found_news LIMIT get_player_news_previews.lmt OFFSET get_player_news_previews.ofst
        ) _news_page
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_news_by_id (news_id text, steam_id text) RETURNS json AS $$
BEGIN
  RETURN news_json(_found_news)
  FROM (
    SELECT * FROM news LEFT JOIN news_read
    ON news_read.news_id = news.id
    AND news_read.steam_id = get_news_by_id.steam_id::bigint
  ) _found_news
  WHERE _found_news.id = get_news_by_id.news_id::uuid;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION create_news (author_steam_id text, title text, content text) RETURNS text AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO news (author_steam_id, title, content)
  VALUES (create_news.author_steam_id::bigint, create_news.title, create_news.content)
  RETURNING id INTO _id;
  RETURN _id::text;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE edit_news (news_id text, title text, content text) AS $$
BEGIN
  UPDATE news
  SET title = edit_news.title,
    content = edit_news.content
  WHERE news.id = edit_news.news_id::uuid;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE publish_news (news_id uuid) AS $$ BEGIN
  UPDATE news
  SET published_on = NOW()
  WHERE news.id = publish_news.news_id;
  DELETE FROM news_read
  WHERE news_read.news_id = publish_news.news_id;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE delete_news (news_id uuid) AS $$ BEGIN
  DELETE FROM news
  WHERE news.id = delete_news.news_id;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE mark_news_read (news_id text, steam_id text) AS $$ BEGIN
  INSERT INTO news_read (news_id, steam_id)
  VALUES (mark_news_read.news_id::uuid, mark_news_read.steam_id::bigint)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE mark_news_hidden (news_id text, steam_id text) AS $$ BEGIN
  CALL mark_news_read(news_id, steam_id);
  UPDATE news_read
  SET hidden_on = NOW()
  WHERE news_read.news_id = mark_news_hidden.news_id::uuid
    AND news_read.steam_id = mark_news_hidden.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;