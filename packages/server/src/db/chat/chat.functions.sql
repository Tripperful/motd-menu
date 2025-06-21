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