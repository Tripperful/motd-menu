CREATE
OR REPLACE PROCEDURE client_add_name (steam_id text, name text) AS $$ BEGIN
INSERT INTO client_names (steam_id, name)
VALUES (
  client_add_name.steam_id::bigint,
  client_add_name.name
) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION client_get_names (steam_id text) RETURNS json AS $$ BEGIN RETURN json_agg(client_names.name)
FROM client_names
WHERE client_names.steam_id = client_get_names.steam_id::bigint
AND client_names.name IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION client_find_by_name (name text) RETURNS json AS $$ BEGIN RETURN json_agg(DISTINCT steam_id::text)
FROM (
  SELECT DISTINCT client_names.steam_id AS steam_id
  FROM client_names
  WHERE client_names.name ILIKE '%' || client_find_by_name.name || '%'
  UNION ALL
  SELECT DISTINCT client_aka.steam_id AS steam_id
  FROM client_aka
  WHERE client_aka.name ILIKE '%' || client_find_by_name.name || '%'
);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE client_connected (
  id text,
  steam_id text,
  server_id int,
  ip text,
  port int,
  name text
) AS $$ BEGIN
INSERT INTO client_connections (id, steam_id, server_id, ip, port)
VALUES (
  id::uuid,
  steam_id::bigint,
  server_id,
  ip::inet,
  port
)
ON CONFLICT DO NOTHING;
IF name IS NOT NULL THEN
  INSERT INTO client_names (steam_id, name)
  VALUES (
    steam_id::bigint,
    name
  )
  ON CONFLICT DO NOTHING;
END IF;
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
  'kevlarSound',
  client_settings.kevlar_sound,
  'fov',
  client_settings.fov,
  'magnumZoomFov',
  client_settings.magnum_zoom_fov,
  'crossbowZoomFov',
  client_settings.crossbow_zoom_fov,
  'esp',
  client_settings.esp,
  'dsp',
  client_settings.dsp,
  'amb',
  client_settings.amb,
  'bob',
  client_settings.bob,
  'drawViewmodel',
  client_settings.draw_viewmodel,
  'hitSoundPaths',
  json_build_object(
    'body',
    client_settings.hitsound_body_path,
    'head',
    client_settings.hitsound_head_path,
    'kill',
    client_settings.killsound_body_path,
    'hskill',
    client_settings.killsound_head_path,
    'teamkill',
    client_settings.killsound_teammate_path
  )
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
  kevlar_sound boolean,
  fov int,
  magnum_zoom_fov int,
  crossbow_zoom_fov int,
  esp boolean,
  dsp boolean,
  amb boolean,
  bob boolean,
  draw_viewmodel boolean,
  hitsound_body_path text,
  hitsound_head_path text,
  killsound_body_path text,
  killsound_head_path text,
  killsound_teammate_path text
) AS $$ BEGIN
INSERT INTO client_settings (
  steam_id,
  hit_sound,
  kill_sound,
  kevlar_sound,
  fov,
  magnum_zoom_fov,
  crossbow_zoom_fov,
  esp,
  dsp,
  amb,
  bob,
  draw_viewmodel,
  hitsound_body_path,
  hitsound_head_path,
  killsound_body_path,
  killsound_head_path,
  killsound_teammate_path
)
VALUES (
  steam_id::bigint,
  hit_sound,
  kill_sound,
  kevlar_sound,
  fov,
  magnum_zoom_fov,
  crossbow_zoom_fov,
  esp,
  dsp,
  amb,
  bob,
  draw_viewmodel,
  hitsound_body_path,
  hitsound_head_path,
  killsound_body_path,
  killsound_head_path,
  killsound_teammate_path
) ON CONFLICT ON CONSTRAINT client_settings_pkey DO UPDATE
SET
  hit_sound = EXCLUDED.hit_sound,
  kill_sound = EXCLUDED.kill_sound,
  kevlar_sound = EXCLUDED.kevlar_sound,
  fov = EXCLUDED.fov,
  magnum_zoom_fov = EXCLUDED.magnum_zoom_fov,
  crossbow_zoom_fov = EXCLUDED.crossbow_zoom_fov,
  esp = EXCLUDED.esp,
  dsp = EXCLUDED.dsp,
  amb = EXCLUDED.amb,
  bob = EXCLUDED.bob,
  draw_viewmodel = EXCLUDED.draw_viewmodel,
  hitsound_body_path = EXCLUDED.hitsound_body_path,
  hitsound_head_path = EXCLUDED.hitsound_head_path,
  killsound_body_path = EXCLUDED.killsound_body_path,
  killsound_head_path = EXCLUDED.killsound_head_path,
  killsound_teammate_path = EXCLUDED.killsound_teammate_path;
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

CREATE
OR REPLACE FUNCTION client_get_smurf_steam_ids (steam_id text) RETURNS json AS $$ BEGIN RETURN json_agg(DISTINCT a.steam_id::text)
FROM get_smurf_connections(client_get_smurf_steam_ids.steam_id) a;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION client_get_time_played (steam_id text, token text) RETURNS float AS $$ BEGIN
RETURN COALESCE(EXTRACT(epoch FROM SUM(COALESCE(disconnected, NOW()) - connected)), 0)
  FROM client_connections
  WHERE client_connections.steam_id = client_get_time_played.steam_id::bigint
    AND connected IS NOT NULL
    AND (
      disconnected IS NOT NULL
      OR
      id = token::uuid
    );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE client_set_aka (steam_id text, name text) AS $$ BEGIN
INSERT INTO client_aka (steam_id, name)
VALUES (
  client_set_aka.steam_id::bigint,
  client_set_aka.name
) ON CONFLICT ON CONSTRAINT client_aka_pkey DO
  UPDATE SET name = EXCLUDED.name;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION client_get_aka (steam_id text) RETURNS text AS $$ BEGIN
RETURN name
FROM client_aka
WHERE client_aka.steam_id = client_get_aka.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE client_delete_aka (steam_id text) AS $$ BEGIN
DELETE FROM client_aka
WHERE client_aka.steam_id = client_delete_aka.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE save_client_cvars (steam_id_text text, cvars_json text) AS $$
DECLARE
    cvar_key text;
    cvar_value text;
    fetch_id uuid := gen_random_uuid();
BEGIN
  FOR cvar_key, cvar_value IN
    SELECT key, value
    FROM json_each_text(cvars_json::json)
  LOOP
    INSERT INTO client_cvars (steam_id, fetch_id, cvar, value, created_on)
    VALUES (steam_id_text::BIGINT, fetch_id, cvar_key, cvar_value, NOW());
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_last_saved_cvar (steam_id text, cvar text) RETURNS text AS $$ BEGIN
RETURN value
FROM client_cvars
WHERE client_cvars.steam_id = get_last_saved_cvar.steam_id::bigint
  AND client_cvars.cvar = get_last_saved_cvar.cvar
ORDER BY created_on DESC
LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_client_custom_rank (steam_id text) RETURNS json AS $$ BEGIN
RETURN rank_data FROM client_custom_ranks
WHERE client_custom_ranks.steam_id = get_client_custom_rank.steam_id::bigint
AND (
SELECT expires_on
  FROM client_custom_rank_subscriptions
  WHERE
    client_custom_rank_subscriptions.steam_id = get_client_custom_rank.steam_id::bigint
  LIMIT 1
) > NOW();
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE set_client_custom_rank (steam_id text, rank_data json) AS $$ BEGIN
IF set_client_custom_rank.rank_data IS NOT NULL THEN
  INSERT INTO client_custom_ranks (steam_id, rank_data)
  VALUES (
    set_client_custom_rank.steam_id::bigint,
    set_client_custom_rank.rank_data
  ) ON CONFLICT ON CONSTRAINT client_custom_ranks_pkey DO
    UPDATE SET rank_data = EXCLUDED.rank_data;
ELSE
  DELETE FROM client_custom_ranks
  WHERE client_custom_ranks.steam_id = set_client_custom_rank.steam_id::bigint;
END IF;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_client_custom_rank_subscription (steam_id text) RETURNS bigint AS $$ BEGIN
RETURN ROUND(
  EXTRACT(
    EPOCH
    FROM client_custom_rank_subscriptions.expires_on
  ) * 1000
)
FROM client_custom_rank_subscriptions
WHERE client_custom_rank_subscriptions.steam_id = get_client_custom_rank_subscription.steam_id::bigint;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE match_started (server_id int, match_data json) AS $$
DECLARE
  map_id int;
  match_team_id int;
  team json;
  player_steam_id text;
BEGIN
IF EXISTS ( -- Don't save if we have a match with this ID
  SELECT FROM matches m WHERE m.id = (match_data->>'id')::uuid
) THEN
  RETURN;
END IF;
SELECT id INTO map_id FROM maps WHERE maps.name = match_data->>'mapName';
IF map_id IS NULL THEN
  INSERT INTO maps(name) VALUES (match_data->>'mapName') RETURNING id INTO map_id;
END IF;
INSERT INTO matches ( 
  id,
  start_tick,
  start_curtime,
  start_time,
  status,
  demo_id,
  map_id,
  server_id,
  initiator
)
VALUES (
  (match_data->>'id')::uuid,
  (match_data->>'tick')::int,
  (match_data->>'curtime')::float,
  NOW(),
  'started',
  match_data->>'demoId',
  map_id,
  match_started.server_id,
  (match_data->>'initiator')::bigint
);
FOR team IN
  SELECT * FROM json_array_elements((match_data->>'teams')::json)
LOOP
  INSERT INTO match_teams (match_id, index, name)
  VALUES (
    (match_data->>'id')::uuid,
    (team->>'index')::smallint,
    team->>'name'
  ) RETURNING id INTO match_team_id;
  FOR player_steam_id IN
    SELECT * FROM json_array_elements_text((team->>'players')::json)
  LOOP
    INSERT INTO match_team_players (
      match_team_id,
      steam_id
    )
    VALUES (
      match_team_id,
      player_steam_id::bigint
    );
  END LOOP;
END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE set_aftermatch_ranks (match_id text, ranks_data json) AS $$
DECLARE
  player_rank_data json;
BEGIN
IF NOT EXISTS (
  SELECT FROM matches m WHERE m.id = set_aftermatch_ranks.match_id::uuid
) THEN
  RETURN;
END IF;
FOR player_rank_data IN
    SELECT * FROM json_array_elements(ranks_data)
LOOP
  UPDATE match_team_players
    SET
    points = (player_rank_data->>'points')::float,
    rank = (player_rank_data->>'rank')::text,
    rank_pos = (player_rank_data->>'pos')::int
    WHERE
      match_team_players.match_team_id IN (
        SELECT id FROM match_teams
        WHERE
          match_teams.match_id = set_aftermatch_ranks.match_id::uuid
      )
      AND
      match_team_players.steam_id = (player_rank_data->>'steamId')::bigint;
END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE match_ended (match_data json) AS $$
DECLARE
  _match_team_id int;
  team json;
  player json;
BEGIN
IF NOT EXISTS ( -- Don't save if not tied to an existing match
  SELECT FROM matches m WHERE m.id = (match_data->>'id')::uuid
) THEN
  RETURN;
END IF;
UPDATE matches
SET 
  status = match_data->>'status',
  end_tick = (match_data->>'tick')::int,
  end_curtime = (match_data->>'curtime')::float,
  end_time = NOW(),
  duration = (match_data->>'duration')::float
WHERE id = (match_data->>'id')::uuid;
FOR team IN
  SELECT * FROM json_array_elements((match_data->>'teams')::json)
LOOP
  SELECT id INTO _match_team_id FROM match_teams
    WHERE
      match_teams.match_id = (match_data->>'id')::uuid
      AND 
      match_teams.index = (team->>'index')::smallint
    LIMIT 1;
  FOR player IN
    SELECT * FROM json_array_elements((team->>'players')::json)
  LOOP
    UPDATE match_team_players
      SET
        kills = (player->>'kills')::int,
        deaths = (player->>'deaths')::int
      WHERE
        match_team_players.match_team_id = _match_team_id
        AND (
          match_team_players.steam_id = (player->>'steamId')::bigint
          OR
          match_team_players.steam_id = find_original_player(
            (match_data->>'id')::uuid,
            (player->>'steamId')::bigint
          )
        );
  END LOOP;
END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE player_death (death_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (death_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO player_deaths (
    match_id,
    tick,
    curtime,
    origin,
    victim_steam_id,
    attacker_steam_id,
    attacker_origin,
    weapon,
    model,
    classname,
    entity_id,
    distance
  ) VALUES (
    (death_data->>'id')::uuid,
    (death_data->>'tick')::int,
    (death_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((death_data->>'origin')::json)->>'x')::float,
      (((death_data->>'origin')::json)->>'y')::float,
      (((death_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (death_data->>'victim')::bigint,
    (death_data->>'attacker')::bigint,
    NULLIF(ARRAY[
      (((death_data->>'attackerOrigin')::json)->>'x')::float,
      (((death_data->>'attackerOrigin')::json)->>'y')::float,
      (((death_data->>'attackerOrigin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    death_data->>'weapon',
    death_data->>'model',
    death_data->>'classname',
    (death_data->>'entityId')::bigint,
    (death_data->>'distance')::float
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE player_respawn (respawn_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (respawn_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO player_respawns (
    match_id,
    tick,
    curtime,
    origin,
    angles,
    steam_id
  ) VALUES (
    (respawn_data->>'id')::uuid,
    (respawn_data->>'tick')::int,
    (respawn_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((respawn_data->>'origin')::json)->>'x')::float,
      (((respawn_data->>'origin')::json)->>'y')::float,
      (((respawn_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    NULLIF(ARRAY[
      (((respawn_data->>'angles')::json)->>'x')::float,
      (((respawn_data->>'angles')::json)->>'y')::float,
      (((respawn_data->>'angles')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (respawn_data->>'steamId')::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE player_damaged (damage_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (damage_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO player_damage (
    match_id,
    tick,
    curtime,
    attacker_steam_id,
    attacker_pos,
    attacker_ang,
    victim_steam_id,
    victim_pos,
    victim_ang,
    hp_before,
    hp_after,
    armor_before,
    armor_after,
    damage,
    damage_type,
    damage_pos,
    weapon,
    classname,
    entity_id,
    hitboxes
  ) VALUES (
    (damage_data->>'id')::uuid,
    (damage_data->>'tick')::int,
    (damage_data->>'curtime')::float,
    (damage_data->>'attacker')::bigint,
    NULLIF(ARRAY[
      (((damage_data->>'attackerPos')::json)->>'x')::float,
      (((damage_data->>'attackerPos')::json)->>'y')::float,
      (((damage_data->>'attackerPos')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    NULLIF(ARRAY[
      (((damage_data->>'attackerAng')::json)->>'x')::float,
      (((damage_data->>'attackerAng')::json)->>'y')::float,
      (((damage_data->>'attackerAng')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (damage_data->>'victim')::bigint,
    NULLIF(ARRAY[
      (((damage_data->>'victimPos')::json)->>'x')::float,
      (((damage_data->>'victimPos')::json)->>'y')::float,
      (((damage_data->>'victimPos')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    NULLIF(ARRAY[
      (((damage_data->>'victimAng')::json)->>'x')::float,
      (((damage_data->>'victimAng')::json)->>'y')::float,
      (((damage_data->>'victimAng')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (damage_data->>'hpBefore')::int,
    (damage_data->>'hpAfter')::int,
    (damage_data->>'armorBefore')::int,
    (damage_data->>'armorAfter')::int,
    (damage_data->>'damage')::float,
    (damage_data->>'damageType')::int,
    NULLIF(ARRAY[
      (((damage_data->>'damageOrigin')::json)->>'x')::float,
      (((damage_data->>'damageOrigin')::json)->>'y')::float,
      (((damage_data->>'damageOrigin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    damage_data->>'weapon',
    damage_data->>'classname',
    (damage_data->>'entityId')::bigint,
    (damage_data->>'hitbox')::json
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE player_attack (attack_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (attack_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO player_attacks (
    match_id,
    tick,
    curtime,
    pos,
    ang,
    entity_id,
    steam_id,
    weapon,
    is_secondary
  ) VALUES (
    (attack_data->>'id')::uuid,
    (attack_data->>'tick')::int,
    (attack_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((attack_data->>'pos')::json)->>'x')::float,
      (((attack_data->>'pos')::json)->>'y')::float,
      (((attack_data->>'pos')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    NULLIF(ARRAY[
      (((attack_data->>'ang')::json)->>'x')::float,
      (((attack_data->>'ang')::json)->>'y')::float,
      (((attack_data->>'ang')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (attack_data->>'entityId')::bigint,
    (attack_data->>'steamId')::bigint,
    attack_data->>'wpn',
    (SELECT attack_data->>'attackType' = '1')
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE item_respawn (respawn_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (respawn_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO item_respawns (
    match_id,
    tick,
    curtime,
    origin,
    item,
    entity_id
  ) VALUES (
    (respawn_data->>'id')::uuid,
    (respawn_data->>'tick')::int,
    (respawn_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((respawn_data->>'origin')::json)->>'x')::float,
      (((respawn_data->>'origin')::json)->>'y')::float,
      (((respawn_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    respawn_data->>'item',
    (respawn_data->>'entityId')::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE weapon_drop (drop_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (drop_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO weapon_drops (
    match_id,
    tick,
    curtime,
    origin,
    steam_id,
    entity_id,
    weapon
  ) VALUES (
    (drop_data->>'id')::uuid,
    (drop_data->>'tick')::int,
    (drop_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((drop_data->>'origin')::json)->>'x')::float,
      (((drop_data->>'origin')::json)->>'y')::float,
      (((drop_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (drop_data->>'steamId')::bigint,
    (drop_data->>'entityId')::bigint,
    drop_data->>'wpn'
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE item_pickup (pickup_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (pickup_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO item_pickups (
    match_id,
    tick,
    curtime,
    origin,
    item,
    steam_id,
    entity_id
  ) VALUES (
    (pickup_data->>'id')::uuid,
    (pickup_data->>'tick')::int,
    (pickup_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((pickup_data->>'origin')::json)->>'x')::float,
      (((pickup_data->>'origin')::json)->>'y')::float,
      (((pickup_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    pickup_data->>'item',
    (pickup_data->>'steamId')::bigint,
    (pickup_data->>'entityId')::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE medkit_pickup (pickup_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (pickup_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO medkit_pickups (
    match_id,
    tick,
    curtime,
    origin,
    steam_id,
    entity_id,
    hp_before,
    hp_after,
    is_big
  ) VALUES (
    (pickup_data->>'id')::uuid,
    (pickup_data->>'tick')::int,
    (pickup_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((pickup_data->>'origin')::json)->>'x')::float,
      (((pickup_data->>'origin')::json)->>'y')::float,
      (((pickup_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (pickup_data->>'steamId')::bigint,
    (pickup_data->>'entityId')::bigint,
    (pickup_data->>'hpBefore')::int,
    (pickup_data->>'hpAfter')::int,
    (SELECT pickup_data->>'big' = '1')
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE battery_pickup (pickup_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (pickup_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO battery_pickups (
    match_id,
    tick,
    curtime,
    origin,
    steam_id,
    entity_id,
    armor_before,
    armor_after
  ) VALUES (
    (pickup_data->>'id')::uuid,
    (pickup_data->>'tick')::int,
    (pickup_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((pickup_data->>'origin')::json)->>'x')::float,
      (((pickup_data->>'origin')::json)->>'y')::float,
      (((pickup_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (pickup_data->>'steamId')::bigint,
    (pickup_data->>'entityId')::bigint,
    (pickup_data->>'armorBefore')::int,
    (pickup_data->>'armorAfter')::int
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE ammo_pickup (pickup_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (pickup_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO ammo_pickups (
    match_id,
    tick,
    curtime,
    origin,
    steam_id,
    ammo_type,
    count_before,
    count_after
  ) VALUES (
    (pickup_data->>'id')::uuid,
    (pickup_data->>'tick')::int,
    (pickup_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((pickup_data->>'origin')::json)->>'x')::float,
      (((pickup_data->>'origin')::json)->>'y')::float,
      (((pickup_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (pickup_data->>'steamId')::bigint,
    (pickup_data->>'ammoIndex')::int,
    (pickup_data->>'prev')::int,
    (pickup_data->>'post')::int
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE charger_use (charge_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (charge_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO charger_uses (
    match_id,
    start_tick,
    start_curtime,
    end_tick,
    end_curtime,
    steam_id,
    entity_id,
    charger_type,
    origin,
    start_hp,
    start_ap,
    end_hp,
    end_ap,
    consumed_hp,
    consumed_ap
  ) VALUES (
    (charge_data->>'id')::uuid,
    (charge_data->>'startTick')::int,
    (charge_data->>'startTime')::float,
    (charge_data->>'endTick')::int,
    (charge_data->>'endTime')::float,
    (charge_data->>'steamId')::bigint,
    (charge_data->>'entityId')::bigint,
    charge_data->>'chargerType',
    NULLIF(ARRAY[
      (((charge_data->>'origin')::json)->>'x')::float,
      (((charge_data->>'origin')::json)->>'y')::float,
      (((charge_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (charge_data->>'startHp')::int,
    (charge_data->>'startAp')::int,
    (charge_data->>'endHp')::int,
    (charge_data->>'endAp')::int,
    (charge_data->>'consumedHp')::int,
    (charge_data->>'consumedAp')::int
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE projectile_spawn (spawn_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (spawn_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO projectile_spawns (
    match_id,
    tick,
    curtime,
    origin,
    projectile,
    steam_id,
    entity_id
  ) VALUES (
    (spawn_data->>'id')::uuid,
    (spawn_data->>'tick')::int,
    (spawn_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((spawn_data->>'origin')::json)->>'x')::float,
      (((spawn_data->>'origin')::json)->>'y')::float,
      (((spawn_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    spawn_data->>'projectile',
    (spawn_data->>'steamId')::bigint,
    (spawn_data->>'entityId')::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE projectile_death (death_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (death_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO projectile_deaths (
    match_id,
    tick,
    curtime,
    origin,
    entity_id,
    killer_entity,
    killer_entity_id,
    killer_steam_id,
    damage,
    damage_type,
    ammo_type,
    lifetime,
    distance
  ) VALUES (
    (death_data->>'id')::uuid,
    (death_data->>'tick')::int,
    (death_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((death_data->>'origin')::json)->>'x')::float,
      (((death_data->>'origin')::json)->>'y')::float,
      (((death_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (death_data->>'entityId')::bigint,
    death_data->>'entityKiller',
    (death_data->>'entityIdKiller')::bigint,
    (death_data->>'killerId')::bigint,
    (death_data->>'damage')::float,
    (death_data->>'damageType')::int,
    (death_data->>'ammoType')::int,
    (death_data->>'lifetime')::float,
    (death_data->>'distance')::float
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE projectile_bounce (bounce_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (bounce_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO projectile_bounces (
    match_id,
    tick,
    curtime,
    origin,
    entity_id,
    distance
  ) VALUES (
    (bounce_data->>'id')::uuid,
    (bounce_data->>'tick')::int,
    (bounce_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((bounce_data->>'origin')::json)->>'x')::float,
      (((bounce_data->>'origin')::json)->>'y')::float,
      (((bounce_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (bounce_data->>'entityId')::bigint,
    (bounce_data->>'distance')::float
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE projectile_owner_change (change_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (change_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO projectile_owner_changes (
    match_id,
    tick,
    curtime,
    origin,
    entity_id,
    prev_owner_steam_id,
    new_owner_steam_id
  ) VALUES (
    (change_data->>'id')::uuid,
    (change_data->>'tick')::int,
    (change_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((change_data->>'origin')::json)->>'x')::float,
      (((change_data->>'origin')::json)->>'y')::float,
      (((change_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (change_data->>'entityId')::bigint,
    (change_data->>'prevOwner')::bigint,
    (change_data->>'newOwner')::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE projectile_lifetime_reset (reset_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (reset_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO projectile_lifetime_resets (
    match_id,
    tick,
    curtime,
    origin,
    entity_id,
    prev_lifetime,
    new_lifetime
  ) VALUES (
    (reset_data->>'id')::uuid,
    (reset_data->>'tick')::int,
    (reset_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((reset_data->>'origin')::json)->>'x')::float,
      (((reset_data->>'origin')::json)->>'y')::float,
      (((reset_data->>'origin')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    (reset_data->>'entityId')::bigint,
    (reset_data->>'timeleft')::float,
    (reset_data->>'newlifetime')::float
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE entity_teleport (teleport_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (teleport_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO entity_teleports (
    match_id,
    tick,
    curtime,
    prev_pos,
    new_pos
  ) VALUES (
    (teleport_data->>'id')::uuid,
    (teleport_data->>'tick')::int,
    (teleport_data->>'curtime')::float,
    NULLIF(ARRAY[
      (((teleport_data->>'prevPos')::json)->>'x')::float,
      (((teleport_data->>'prevPos')::json)->>'y')::float,
      (((teleport_data->>'prevPos')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float]),
    NULLIF(ARRAY[
      (((teleport_data->>'newPos')::json)->>'x')::float,
      (((teleport_data->>'newPos')::json)->>'y')::float,
      (((teleport_data->>'newPos')::json)->>'z')::float
    ], ARRAY[NULL::float, NULL::float, NULL::float])
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE player_substitution (substitution_data json) AS $$ BEGIN
  IF NOT EXISTS ( -- Don't save if not tied to an existing match
    SELECT FROM matches m WHERE m.id = (substitution_data->>'id')::uuid
  ) THEN
    RETURN;
  END IF;
  INSERT INTO player_substitutions (
    match_id,
    tick,
    curtime,
    from_steam_id,
    to_steam_id
  ) VALUES (
    (substitution_data->>'id')::uuid,
    (substitution_data->>'tick')::int,
    (substitution_data->>'curtime')::float,
    (substitution_data->>'oldPlayer')::bigint,
    (substitution_data->>'newPlayer')::bigint
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION match_json (match matches) RETURNS json AS $$ BEGIN RETURN json_build_object(
  'id',
  match.id::text,
  'status',
  match.status,
  'server',
  (SELECT servers.name FROM servers WHERE servers.id = match.server_id),
  'mapName',
  (SELECT maps.name FROM maps WHERE maps.id = match.map_id),
  'demoName',
  match.demo_id,
  'demoLink',
  REPLACE(
    (
      SELECT servers.demos_url
      FROM servers
      WHERE servers.id = match.server_id
    ), '<demo_id>', match.demo_id
  ),
  'initiator',
  match.initiator::text,
  'duration',
  ROUND(match.duration),
  'startDate',
  ROUND(EXTRACT(
    EPOCH
    FROM match.start_time
  ) * 1000),
  'startCurtime',
  match.start_curtime,
  'endCurtime',
  match.end_curtime,
  'teams',
  (
    SELECT COALESCE(json_agg(
      json_build_object(
        'name',
        match_teams.name,
        'index',
        match_teams.index,
        'players',
        (
          SELECT json_agg(
            json_build_object(
              'steamId',
              match_team_players.steam_id::text,
              'kills',
              match_team_players.kills,
              'deaths',
              match_team_players.deaths,
              'points',
              match_team_players.points,
              'rank',
              match_team_players.rank,
              'rankPos',
              match_team_players.rank_pos
            )
          ) FROM match_team_players WHERE match_team_players.match_team_id = match_teams.id
        )
      )
    ), '[]'::json) FROM match_teams WHERE match_teams.match_id = match.id
  )
);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_match (match_id text) RETURNS json AS $$
DECLARE
  match matches;
BEGIN
SELECT * INTO match FROM matches WHERE matches.id = get_match.match_id::uuid LIMIT 1;
RETURN match_json(match);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_matches (
  map_name_filter text,
  players_filter json,
  server_filter text,
  status_filter json,
  lmt int,
  ofst int
) RETURNS json AS $$
DECLARE
  total int;
  match_json json;
BEGIN
RETURN (
  WITH found_matches AS (
    SELECT * FROM matches
    WHERE (
      map_name_filter IS NULL
      OR
      map_id IN (SELECT id FROM maps WHERE maps.name ILIKE '%' || map_name_filter || '%')
    )
    AND (
      players_filter IS NULL
      OR
      (
        SELECT COUNT(*)
        FROM match_team_players
        WHERE match_team_players.match_team_id IN (
          SELECT id FROM match_teams WHERE match_teams.match_id = matches.id
        )
        AND match_team_players.steam_id::text = ANY(ARRAY(SELECT * FROM json_array_elements_text(players_filter)))
      ) = json_array_length(players_filter)
    )
    AND (
      server_filter IS NULL
      OR
      server_id IN (SELECT id FROM servers WHERE servers.name ILIKE '%' || server_filter || '%')
    )
    AND (
      status_filter IS NULL
      OR
      status = ANY(ARRAY(SELECT * FROM json_array_elements_text(status_filter)))
    )
    ORDER BY start_time DESC
  )
  SELECT json_build_object(
    'total',
    (SELECT COUNT(*) FROM found_matches),
    'data',
    (
      SELECT COALESCE(json_agg(match_json(matches_page)), '[]'::json)
      FROM (
        SELECT * FROM found_matches LIMIT lmt OFFSET ofst
      ) matches_page
    )
  )
);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_match_deaths (match_id text) RETURNS json AS $$
DECLARE
  is_dm boolean;
BEGIN
SELECT COUNT(*) = 1 INTO is_dm
FROM match_teams
WHERE match_teams.match_id = get_match_deaths.match_id::uuid;
RETURN json_agg(
  json_build_object(
    'curtime',
    curtime,
    'attackerSteamId',
    attacker_steam_id::text,
    'victimSteamId',
    victim_steam_id::text,
    'weapon',
    weapon,
    'attackerScoreChange',
    attacker_score_change,
    'victimScoreChange',
    victim_score_change
  )
) FROM (
  WITH teams AS (
    SELECT steam_id, index
    FROM match_teams, match_team_players
    WHERE match_teams.match_id = get_match_deaths.match_id::uuid
    AND match_teams.id = match_team_players.match_team_id
  )
  SELECT
    curtime,
    attacker_steam_id,
    victim_steam_id,
    weapon,
    (
      SELECT CASE
        WHEN (
          NOT is_dm
          AND
          (SELECT index FROM teams WHERE teams.steam_id = attacker_steam_id)
          =
          (SELECT index FROM teams WHERE teams.steam_id = victim_steam_id)
        ) THEN -1
        WHEN (
          attacker_steam_id IS NOT NULL
          AND
          attacker_steam_id != 0
        ) THEN 1
        ELSE 0
      END
    ) AS attacker_score_change,
    (
      SELECT CASE
        WHEN (
          attacker_steam_id = victim_steam_id
          OR
          attacker_steam_id = 0
          OR
          attacker_steam_id = NULL
        ) THEN -1
        ELSE 0
      END
    ) AS victim_score_change
  FROM player_deaths
  WHERE player_deaths.match_id = get_match_deaths.match_id::uuid
  ORDER BY curtime ASC
);
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_match_damage (match_id text) RETURNS json AS $$
DECLARE
  is_dm boolean;
BEGIN
SELECT COUNT(*) = 1 INTO is_dm
FROM match_teams
WHERE match_teams.match_id = get_match_damage.match_id::uuid;
RETURN json_agg(
  json_build_object(
    'steamId',
    steam_id::text,
    'damageDealtByWeapon',
    (
      SELECT json_object_agg(
        weapon,
        damage
      ) FROM (
        SELECT
          weapon,
          SUM(hp_before - hp_after + armor_before - armor_after) AS damage
        FROM player_damage
        WHERE player_damage.match_id = get_match_damage.match_id::uuid
        AND player_damage.attacker_steam_id = match_team_players.steam_id
        GROUP BY weapon
      ) AS weapon_dmg
    )
  )
) FROM match_team_players
  WHERE match_team_players.match_team_id IN (
    SELECT id FROM match_teams WHERE match_teams.match_id = get_match_damage.match_id::uuid
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION hitboxes_total_hits (hitboxes json) RETURNS int AS $$
DECLARE
  total_hits int;
BEGIN
  SELECT 
    SUM((value)::int) INTO total_hits
  FROM 
    json_each_text(hitboxes) AS kv(key, value);
  RETURN total_hits;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_match_player_accuracy (match_id text, steam_id text) RETURNS json AS $$
DECLARE
  _hitscan_weapons text[];
  _hitscan_dmg text[];
  _total_shots int;
  _total_hits int;
  _total_hs int;
BEGIN
  _hitscan_weapons := ARRAY['weapon_pistol', 'weapon_357', 'weapon_smg1', 'weapon_ar2', 'weapon_shotgun'];
  _hitscan_dmg := ARRAY['pistol', '357', 'smg1', 'ar2', 'shotgun'];

  SELECT SUM(
      CASE WHEN weapon = 'weapon_shotgun'
      THEN
        CASE WHEN is_secondary = true THEN 12 ELSE 7 END
        ELSE 1
      END
    )
    INTO _total_shots
    FROM player_attacks
    WHERE weapon = ANY(_hitscan_weapons)
    AND player_attacks.steam_id = get_match_player_accuracy.steam_id::bigint
    AND player_attacks.match_id = get_match_player_accuracy.match_id::uuid;

  SELECT SUM(hitbox_hits.hits) INTO _total_hits
    FROM (
      SELECT SUM(hb) AS hits
      FROM (
        SELECT ((json_each_text(hitboxes)).value)::int AS hb
        FROM player_damage
        WHERE weapon = ANY(_hitscan_dmg)
        AND player_damage.attacker_steam_id = get_match_player_accuracy.steam_id::bigint
        AND player_damage.match_id = get_match_player_accuracy.match_id::uuid
      )
    ) hitbox_hits;

  SELECT SUM(hs_hits.hits) INTO _total_hs
    FROM (
      SELECT SUM((hitboxes->>'1')::int) AS hits
      FROM player_damage
      WHERE weapon = ANY(_hitscan_dmg)
      AND player_damage.attacker_steam_id = get_match_player_accuracy.steam_id::bigint
      AND player_damage.match_id = get_match_player_accuracy.match_id::uuid
      AND hitboxes->'1' IS NOT NULL
    ) hs_hits;

  RETURN json_build_object(
    'steamId',
    steam_id::text,
    'fired',
    COALESCE(_total_shots, 0),
    'hit',
    COALESCE(_total_hits, 0),
    'hs',
    COALESCE(_total_hs, 0),
    'team',
    (
      SELECT match_teams.index
      FROM match_teams
      WHERE match_teams.match_id = get_match_player_accuracy.match_id::uuid
      AND EXISTS (
        SELECT *
        FROM match_team_players
        WHERE match_team_players.match_team_id = match_teams.id AND (
          match_team_players.steam_id = get_match_player_accuracy.steam_id::bigint
          OR
          match_team_players.steam_id = find_original_player(
            get_match_player_accuracy.match_id::uuid,
            get_match_player_accuracy.steam_id::bigint
          )
        )
      )
    ),
    'originalPlayer',
    (
      WITH _original_player AS (
        SELECT find_original_player(
          get_match_player_accuracy.match_id::uuid,
          get_match_player_accuracy.steam_id::bigint
        ) AS original_id
      )
      SELECT CASE
        WHEN op.original_id = get_match_player_accuracy.steam_id::bigint THEN NULL
        ELSE op.original_id::text
      END
      FROM _original_player op
    ),
    'weaponStats',
    (
      WITH _distinct_attack_types AS (
        SELECT DISTINCT attack_type
        FROM damage_attack_info
      ) SELECT json_object_agg(
        attack_type,
        json_build_object(
          'fired',
          COALESCE(
            (
              SELECT SUM(
                CASE WHEN player_attacks.weapon = 'weapon_shotgun'
                THEN
                  CASE WHEN is_secondary = true THEN 12 ELSE 7 END
                  ELSE 1
                END
              )
              FROM player_attacks
              WHERE player_attacks.match_id = get_match_player_accuracy.match_id::uuid
              AND player_attacks.steam_id = get_match_player_accuracy.steam_id::bigint
              AND player_attacks.weapon IN (
                SELECT weapon
                FROM damage_attack_info
                WHERE player_attacks.weapon = damage_attack_info.weapon
                AND damage_attack_info.attack_type = _distinct_attack_types.attack_type
                AND (
                  player_attacks.is_secondary = damage_attack_info.is_secondary
                  OR damage_attack_info.is_secondary IS NULL
                )
                LIMIT 1
              )
            ),
            0
          ),
          'hit',
          (
            WITH _hits_counts AS (
              SELECT
                SUM(hb) AS hits,
                SUM(hs) AS headshots,
                SUM(dmg) AS damage
              FROM (
                SELECT 
                  hitboxes_total_hits(hitboxes) AS hb,
                  (hitboxes->>'1')::int AS hs,
                  hp_before - hp_after + armor_before - armor_after AS dmg
                FROM player_damage
                WHERE player_damage.match_id = get_match_player_accuracy.match_id::uuid
                AND player_damage.attacker_steam_id = get_match_player_accuracy.steam_id::bigint
                AND player_damage.weapon IN (
                  SELECT damage_type
                  FROM damage_attack_info
                  WHERE damage_attack_info.attack_type = _distinct_attack_types.attack_type
                )
              )
            ) SELECT json_build_object(
              'total',
              COALESCE((SELECT hits FROM _hits_counts), 0),
              'hs',
              COALESCE((SELECT headshots FROM _hits_counts), 0),
              'damage',
              COALESCE((SELECT damage FROM _hits_counts), 0)
            )
          )
        )
      ) FROM _distinct_attack_types
    ) 
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_match_accuracy (match_id text) RETURNS json AS $$ BEGIN
  RETURN json_agg(
    get_match_player_accuracy(match_id, match_team_players.steam_id::text)
  ) FROM match_team_players
  WHERE match_team_players.match_team_id IN (
    SELECT id
    FROM match_teams
    WHERE match_teams.match_id = get_match_accuracy.match_id::uuid
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_match_player_misc_stats (match_id text, steam_id text) RETURNS json AS $$ BEGIN
  RETURN json_build_object(
    'chargerUses',
    (
      SELECT json_build_object(
        'timeUsed', time_used,
        'hpConsumed', hp_consumed,
        'apConsumed', ap_consumed
      )
      FROM (
        SELECT
          SUM(end_curtime - start_curtime) AS time_used,
          COALESCE(SUM(consumed_hp), NULL) AS hp_consumed,
          COALESCE(SUM(consumed_ap), NULL) AS ap_consumed
        FROM charger_uses
        WHERE charger_uses.match_id = get_match_player_misc_stats.match_id::uuid
        AND charger_uses.steam_id = get_match_player_misc_stats.steam_id::bigint
      )
    ),
    'pickups',
    (
      WITH distinct_player_respawn_positions AS (
        SELECT DISTINCT origin FROM player_respawns
        WHERE player_respawns.match_id = get_match_player_misc_stats.match_id::uuid
        AND player_respawns.steam_id = get_match_player_misc_stats.steam_id::bigint
      ) SELECT json_object_agg(
        item_type,
        item_count
      )
      FROM (
        SELECT
          item AS item_type,
          COUNT(*) AS item_count
        FROM item_pickups
        WHERE item_pickups.match_id = get_match_player_misc_stats.match_id::uuid
        AND item_pickups.steam_id = get_match_player_misc_stats.steam_id::bigint
        AND item_pickups.origin NOT IN (SELECT origin FROM distinct_player_respawn_positions)
        GROUP BY item
      ) AS item_counts
    ),
    'catches',
    (
      WITH match_projectile_spawns AS (
        SELECT * FROM projectile_spawns
        WHERE projectile_spawns.match_id = get_match_player_misc_stats.match_id::uuid
      ) SELECT json_object_agg(
        projectile,
        catch_count
      ) FROM (
        SELECT (
          SELECT projectile
          FROM match_projectile_spawns
          WHERE match_projectile_spawns.entity_id = projectile_owner_changes.entity_id
          LIMIT 1
        ) AS projectile, COUNT(*) AS catch_count
        FROM projectile_owner_changes
        WHERE projectile_owner_changes.match_id = get_match_player_misc_stats.match_id::uuid
        AND projectile_owner_changes.new_owner_steam_id = get_match_player_misc_stats.steam_id::bigint
        GROUP BY projectile
      ) WHERE projectile IS NOT NULL
    )
  ); 
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_efps_stats (match_id text) RETURNS json AS $$ BEGIN RETURN json_build_object(
  'id',
  get_efps_stats.match_id,
  'server',
  (SELECT servers.name FROM servers WHERE servers.id = server_id),
  'map',
  (SELECT maps.name FROM maps WHERE maps.id = map_id),
  'demo',
  demo_id,
  'teamplay',
  (CASE WHEN (
    SELECT COUNT(*)
    FROM match_teams
    WHERE match_teams.match_id = get_efps_stats.match_id::uuid
    ) > 1 THEN true ELSE false END
  ),
  'startTime',
  ROUND(EXTRACT(EPOCH FROM start_time)),
  'endTime',
  ROUND(EXTRACT(EPOCH FROM end_time)),
  'initiator',
  initiator::text,
  'matchDuration',
  ROUND(duration),
  'kills',
  (
    SELECT json_agg(
      json_build_object(
        'attacker',
        json_build_object(
          'steamId',
          player_deaths.attacker_steam_id::text,
          'team',
          (
            SELECT match_teams.index
            FROM match_teams
            WHERE match_teams.match_id = get_efps_stats.match_id::uuid
            AND EXISTS (
              SELECT *
              FROM match_team_players
              WHERE match_team_players.match_team_id = match_teams.id AND (
                match_team_players.steam_id = player_deaths.attacker_steam_id
                OR
                match_team_players.steam_id = find_original_player(
                  get_efps_stats.match_id::uuid,
                  player_deaths.attacker_steam_id
                )
              )
            )
          )
        ),
        'victim',
        json_build_object(
          'steamId',
          player_deaths.victim_steam_id::text,
          'team',
          (
            SELECT match_teams.index
            FROM match_teams
            WHERE match_teams.match_id = get_efps_stats.match_id::uuid
            AND EXISTS (
              SELECT *
              FROM match_team_players
              WHERE match_team_players.match_team_id = match_teams.id AND (
                match_team_players.steam_id = player_deaths.victim_steam_id
                OR
                match_team_players.steam_id = find_original_player(
                  get_efps_stats.match_id::uuid,
                  player_deaths.victim_steam_id
                )
              )
            )
          )
        ),
        'weapon',
        player_deaths.weapon
      )
    )
    FROM player_deaths
    WHERE player_deaths.match_id = get_efps_stats.match_id::uuid
  ),
  'stats',
  (
    SELECT json_agg(
      get_match_player_accuracy(get_efps_stats.match_id, p.steam_id::text)
    ) FROM (
      SELECT DISTINCT steam_id FROM (
        SELECT steam_id
        FROM match_team_players 
        WHERE match_team_players.match_team_id IN (
          SELECT id
          FROM match_teams
          WHERE match_teams.match_id = get_efps_stats.match_id::uuid
        )

        UNION ALL

        SELECT to_steam_id AS steam_id
        FROM player_substitutions
        WHERE player_substitutions.match_id = get_efps_stats.match_id::uuid
      )
    ) p
  )
)
FROM matches
WHERE matches.id = get_efps_stats.match_id::uuid
LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE PROCEDURE mark_sent_to_efps (match_id text) AS $$ BEGIN
  UPDATE matches
  SET sent_to_efps = true
  WHERE matches.id = mark_sent_to_efps.match_id::uuid;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_not_sent_to_efps () RETURNS json AS $$ BEGIN
  RETURN json_agg(matches.id::text)
  FROM matches
  WHERE matches.sent_to_efps != true
  AND (SELECT is_dev FROM servers WHERE servers.id = matches.server_id LIMIT 1) != true
  AND matches.status = 'completed';
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_last_client_ip (steam_id text) RETURNS text AS $$ BEGIN
  RETURN (
    SELECT host(ip)
    FROM client_connections
    WHERE client_connections.steam_id = get_last_client_ip.steam_id::bigint
    ORDER BY connected DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION find_original_player(match_uuid UUID, current_steam BIGINT) 
RETURNS BIGINT AS $$
DECLARE
    player BIGINT := current_steam;
    prev_player BIGINT;
BEGIN
    WHILE player NOT IN (
        SELECT steam_id
        FROM match_team_players
        WHERE match_team_players.match_team_id IN (
            SELECT id FROM match_teams WHERE match_teams.match_id = match_uuid
        )
    ) LOOP
        SELECT from_steam_id INTO prev_player
        FROM player_substitutions
        WHERE match_id = match_uuid AND to_steam_id = player;

        IF NOT FOUND OR prev_player = current_steam THEN
            EXIT;
        END IF;

        player := prev_player;
    END LOOP;

    RETURN player;
END;
$$ LANGUAGE plpgsql;