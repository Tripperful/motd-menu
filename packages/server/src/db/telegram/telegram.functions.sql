CREATE
OR REPLACE PROCEDURE tg_link_client (
  _steam_id text,
  _client_id bigint,
  _chat_id bigint
) AS $$ BEGIN
  INSERT INTO tg_clients (steam_id, client_id, chat_id)
  VALUES (
    _steam_id::bigint,
    _client_id,
    _chat_id
  )
  ON CONFLICT (steam_id) DO
  UPDATE SET
    client_id = _client_id,
    chat_id = _chat_id;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE tg_unlink_client (_steam_id text) AS $$ BEGIN
  DELETE FROM tg_clients
  WHERE steam_id = _steam_id::bigint;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION tg_get_client_by_steam_id (_steam_id text) RETURNS json AS $$ BEGIN
  RETURN (
    SELECT json_build_object(
      'steamId', _steam_id,
      'clientId', client_id,
      'chatId', chat_id
    )
    FROM tg_clients
    WHERE steam_id = _steam_id::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION tg_get_client_by_client_id (_client_id bigint) RETURNS json AS $$ BEGIN
  RETURN (
    SELECT json_build_object(
      'steamId', steam_id::text,
      'clientId', _client_id,
      'chatId', chat_id
    )
    FROM tg_clients
    WHERE client_id = _client_id
  );
END;
$$ LANGUAGE plpgsql;