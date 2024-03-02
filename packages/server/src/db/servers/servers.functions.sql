CREATE
OR REPLACE FUNCTION server_by_key (api_key text) RETURNS json AS $$
BEGIN RETURN json_build_object(
    'id',
    servers.id,
    'ip',
    servers.ip::text,
    'port',
    servers.port,
    'name',
    servers.name,
    'blocked',
    servers.blocked
  ) FROM servers WHERE servers.api_key = server_by_key.api_key LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION dev_token_steam_id (dev_token text) RETURNS text AS $$
BEGIN RETURN steam_id::text
  FROM dev_tokens
  WHERE dev_tokens.token = dev_token;
END;
$$ LANGUAGE plpgsql;