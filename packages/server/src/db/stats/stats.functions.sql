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
WHERE client_names.steam_id = client_get_names.steam_id::bigint;
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
        AND
        match_team_players.steam_id = (player->>'steamId')::bigint;
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
    (spawn_data->>'entityId')::bigint,
    (spawn_data->>'steamId')::bigint
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
OR REPLACE FUNCTION match_json(match matches) RETURNS json AS $$ BEGIN RETURN json_build_object(
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
  'initiator',
  match.initiator::text,
  'duration',
  ROUND(match.duration),
  'startDate',
  ROUND(EXTRACT(
    EPOCH
    FROM match.start_time
  ) * 1000),
  'teams',
  (
    SELECT json_agg(
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
              match_team_players.deaths
            )
          ) FROM match_team_players WHERE match_team_players.match_team_id = match_teams.id
        )
      )
    ) FROM match_teams WHERE match_teams.match_id = match.id
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
OR REPLACE FUNCTION get_matches (lmt int, ofst int) RETURNS json AS $$
DECLARE
  total int;
  match_json json;
BEGIN
SELECT COUNT(*) INTO total FROM matches WHERE matches.status != 'started';
RETURN json_build_object(
  'total',
  total,
  'data',
  json_agg(match_json(matches_record))
)
FROM (
  SELECT * FROM matches
  WHERE matches.status != 'started'
  ORDER BY start_time DESC
  LIMIT lmt OFFSET ofst
) AS matches_record;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_efps_accuracy (match_id uuid, steam_id bigint) RETURNS json AS $$
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
    AND player_attacks.steam_id = get_efps_accuracy.steam_id
    AND player_attacks.match_id = get_efps_accuracy.match_id;

  SELECT SUM(hitbox_hits.hits) INTO _total_hits
    FROM (
      SELECT SUM(hb) AS hits
      FROM (
        SELECT ((json_each_text(hitboxes)).value)::int AS hb
        FROM player_damage
        WHERE weapon = ANY(_hitscan_dmg)
        AND player_damage.attacker_steam_id = get_efps_accuracy.steam_id
        AND player_damage.match_id = get_efps_accuracy.match_id
      )
    ) hitbox_hits;

  SELECT SUM(hs_hits.hits) INTO _total_hs
    FROM (
      SELECT SUM((hitboxes->>'1')::int) AS hits
      FROM player_damage
      WHERE weapon = ANY(_hitscan_dmg)
      AND player_damage.attacker_steam_id = get_efps_accuracy.steam_id
      AND player_damage.match_id = get_efps_accuracy.match_id
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
      WHERE match_teams.match_id = get_efps_accuracy.match_id
      AND EXISTS (
        SELECT *
        FROM match_team_players
        WHERE match_team_players.steam_id = get_efps_accuracy.steam_id
        AND match_team_players.match_team_id = match_teams.id
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION get_efps_stats (match_id text) RETURNS json AS $$ BEGIN RETURN json_build_object(
  'server',
  (SELECT servers.name FROM servers WHERE servers.id = server_id),
  'map',
  (SELECT maps.name FROM maps WHERE maps.id = map_id),
  'teamplay',
  (CASE WHEN (
    SELECT COUNT(*)
    FROM match_teams
    WHERE match_teams.match_id = get_efps_stats.match_id::uuid
    ) > 1 THEN true ELSE false END
  ),
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
              WHERE match_team_players.steam_id = player_deaths.attacker_steam_id
              AND match_team_players.match_team_id = match_teams.id
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
              WHERE match_team_players.steam_id = player_deaths.victim_steam_id
              AND match_team_players.match_team_id = match_teams.id
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
      get_efps_accuracy(get_efps_stats.match_id::uuid, match_team_players.steam_id)
    )
    FROM match_team_players
    WHERE match_team_players.match_team_id IN (
      SELECT id
      FROM match_teams
      WHERE match_teams.match_id = get_efps_stats.match_id::uuid
    )
  )
)
FROM matches
WHERE matches.id = get_efps_stats.match_id::uuid
LIMIT 1;
END;
$$ LANGUAGE plpgsql;