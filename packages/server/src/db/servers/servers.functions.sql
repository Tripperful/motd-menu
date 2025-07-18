CREATE
OR REPLACE FUNCTION server_json (server servers) RETURNS json AS $$ BEGIN
RETURN (
  CASE WHEN server IS NULL THEN NULL
  ELSE
  json_build_object(
    'id',
    server.id,
    'ip',
    server.ip::text,
    'port',
    server.port,
    'name',
    server.name,
    'blocked',
    server.blocked,
    'isDev',
    server.is_dev
  )
END);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION server_by_id (server_id int) RETURNS json AS $$
DECLARE
  server servers;
BEGIN
SELECT * INTO server FROM servers WHERE servers.id = server_by_id.server_id LIMIT 1;
RETURN server_json(server);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION server_by_key (api_key text) RETURNS json AS $$
DECLARE
  server servers;
BEGIN 
SELECT * INTO server
FROM servers
WHERE servers.api_key = MD5(server_by_key.api_key)
LIMIT 1;
RETURN server_json(server);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION dev_token_steam_id (dev_token text) RETURNS text AS $$
BEGIN RETURN steam_id::text
  FROM dev_tokens
  WHERE dev_tokens.token = dev_token;
END;
$$ LANGUAGE plpgsql;