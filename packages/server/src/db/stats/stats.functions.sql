CREATE
OR REPLACE PROCEDURE client_add_name (
  steam_id text,
  name text
) AS $$ BEGIN
INSERT INTO client_names (steam_id, name)
VALUES (
  client_add_name.steam_id::bigint,
  client_add_name.name
) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE client_connected (
  id text,
  steam_id text,
  ip text,
  port int,
  name text
) AS $$ BEGIN
INSERT INTO client_connections (id, steam_id, ip, port)
VALUES (
  id::uuid,
  steam_id::bigint,
  ip::inet,
  port
)
ON CONFLICT DO NOTHING;
INSERT INTO client_names (steam_id, name)
VALUES (
  steam_id::bigint,
  name
)
ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE client_disconnected (
  id text,
  in_avg_latency float,
  in_avg_loss float,
  in_avg_choke float,
  in_avg_packets float,
  in_total_data float,
  out_avg_latency float,
  out_avg_loss float,
  out_avg_choke float,
  out_avg_packets float,
  out_total_data float
) AS $$ BEGIN
UPDATE client_connections
SET
  disconnected = NOW(),
  in_avg_latency = client_disconnected.in_avg_latency,
  in_avg_loss = client_disconnected.in_avg_loss,
  in_avg_choke = client_disconnected.in_avg_choke,
  in_avg_packets = client_disconnected.in_avg_packets,
  in_total_data = client_disconnected.in_total_data,
  out_avg_latency = client_disconnected.out_avg_latency,
  out_avg_loss = client_disconnected.out_avg_loss,
  out_avg_choke = client_disconnected.out_avg_choke,
  out_avg_packets = client_disconnected.out_avg_packets,
  out_total_data = client_disconnected.out_total_data
WHERE client_connections.id = client_disconnected.id::uuid;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_client_settings (steam_id text) RETURNS json AS $$ BEGIN RETURN json_build_object(
  'hitSound',
  client_settings.hit_sound,
  'killSound',
  client_settings.kill_sound,
  'fov',
  client_settings.fov,
  'esp',
  client_settings.esp,
  'drawViewmodel',
  client_settings.draw_viewmodel
)
FROM client_settings
WHERE client_settings.steam_id = get_client_settings.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE set_client_settings (
  steam_id text,
  hit_sound boolean,
  kill_sound boolean,
  fov int,
  esp boolean,
  draw_viewmodel boolean
) AS $$ BEGIN
INSERT INTO client_settings (
  steam_id,
  hit_sound,
  kill_sound,
  fov,
  esp,
  draw_viewmodel
)
VALUES (
  steam_id::bigint,
  hit_sound,
  kill_sound,
  fov,
  esp,
  draw_viewmodel
) ON CONFLICT ON CONSTRAINT client_settings_pkey DO UPDATE
SET
  hit_sound = EXCLUDED.hit_sound,
  kill_sound = EXCLUDED.kill_sound,
  fov = EXCLUDED.fov,
  esp = EXCLUDED.esp,
  draw_viewmodel = EXCLUDED.draw_viewmodel;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_smurf_connections (steam_id text) RETURNS SETOF client_connections AS $$
DECLARE
  prev_smurf_count int;
  cur_smurf_count int;
BEGIN
  CREATE TEMP TABLE smurf_ids ( 
    id uuid
  ) ON COMMIT DROP;

  LOOP
    SELECT COUNT(*) INTO prev_smurf_count FROM smurf_ids;

    INSERT INTO smurf_ids (id)
      SELECT client_connections.id FROM client_connections
      WHERE
        client_connections.id NOT IN (SELECT smurf_ids.id FROM smurf_ids)
          AND
          (
            client_connections.steam_id = get_smurf_connections.steam_id::bigint
            OR
            client_connections.steam_id IN (
              SELECT client_connections.steam_id
              FROM client_connections
              WHERE client_connections.id IN (SELECT smurf_ids.id FROM smurf_ids)
            )
            OR
            client_connections.ip IN (
              SELECT client_connections.ip
              FROM client_connections
              WHERE client_connections.id IN (SELECT smurf_ids.id FROM smurf_ids)
            )
          );

    SELECT COUNT(*) INTO cur_smurf_count FROM smurf_ids;
    
    EXIT WHEN prev_smurf_count = cur_smurf_count;
  END LOOP;

  RETURN QUERY SELECT * FROM client_connections WHERE client_connections.id IN (SELECT smurf_ids.id FROM smurf_ids);
END;
$$ LANGUAGE plpgsql;