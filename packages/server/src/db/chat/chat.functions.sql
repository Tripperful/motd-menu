CREATE OR REPLACE PROCEDURE add_chat_message (
  steam_id text,
  message text,
  server_id int,
  team_idx int,
  match_id text
) AS $$
BEGIN
  INSERT INTO chat_messages(steam_id, message, server_id, team_idx, match_id)
  VALUES (
    add_chat_message.steam_id::bigint,
    add_chat_message.message,
    add_chat_message.server_id,
    add_chat_message.team_idx::smallint,
    add_chat_message.match_id::uuid
  );
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE set_player_languages (
  p_steam_id text,
  p_languages json
) AS $$
BEGIN
  INSERT INTO player_languages(steam_id, languages)
  VALUES (
    p_steam_id::bigint,
    p_languages
  )
  ON CONFLICT (steam_id) DO
    UPDATE SET languages = EXCLUDED.languages;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE FUNCTION get_player_languages (
  p_steam_id text
) RETURNS json AS $$
BEGIN
  RETURN (
    SELECT player_languages.languages
    FROM player_languages
    WHERE steam_id = p_steam_id::bigint
  );
END;
$$ LANGUAGE plpgsql;