CREATE TABLE IF NOT EXISTS
  client_connections (
    id uuid PRIMARY KEY,
    steam_id bigint NOT NULL,
    ip inet NOT NULL,
    port int NOT NULL,
    connected timestamp DEFAULT NOW(),
    disconnected timestamp,
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
  );

CREATE TABLE IF NOT EXISTS
  client_names (
    id SERIAL PRIMARY KEY,
    steam_id bigint,
    name text,
    UNIQUE (steam_id, name)
  );

CREATE TABLE IF NOT EXISTS
  client_settings (
    steam_id bigint PRIMARY KEY,
    hit_sound boolean,
    kill_sound boolean,
    fov int,
    esp boolean,
    draw_viewmodel boolean
  );

CREATE TABLE IF NOT EXISTS
  client_aka (steam_id bigint PRIMARY KEY, name text);

CREATE TABLE IF NOT EXISTS
  matches (
    id uuid PRIMARY KEY,
    map_id int REFERENCES maps (id),
    server_id int REFERENCES servers (id),
    demo_id text,
    initiator bigint,
    start_tick int,
    start_curtime float,
    start_time timestamp,
    end_tick int,
    end_curtime float,
    end_time timestamp,
    duration float,
    status text
  );

CREATE TABLE IF NOT EXISTS
  match_teams (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    index smallint,
    name text,
    UNIQUE (match_id, index)
  );

CREATE TABLE IF NOT EXISTS
  match_team_players (
    id SERIAL PRIMARY KEY,
    match_team_id int REFERENCES match_teams (id) ON DELETE CASCADE,
    steam_id bigint,
    kills int,
    deaths int,
    UNIQUE (match_team_id, steam_id)
  );

CREATE TABLE IF NOT EXISTS
  player_deaths (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    victim_steam_id bigint,
    attacker_steam_id bigint,
    attacker_origin float[3],
    weapon text,
    model text,
    classname text,
    entity_id bigint
  );

CREATE TABLE IF NOT EXISTS
  player_respawns (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    angles float[3],
    steam_id bigint
  );

CREATE TABLE IF NOT EXISTS
  player_damage (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    attacker_steam_id bigint,
    attacker_pos float[3],
    attacker_ang float[3],
    victim_steam_id bigint,
    victim_pos float[3],
    victim_ang float[3],
    hp_before int,
    hp_after int,
    armor_before int,
    armor_after int,
    damage float,
    damage_type int,
    damage_pos float[3],
    weapon text,
    classname text,
    entity_id bigint,
    hitboxes json
  );

CREATE TABLE IF NOT EXISTS
  player_attacks (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    pos float[3],
    ang float[3],
    entity_id bigint,
    steam_id bigint,
    weapon text,
    is_secondary boolean
  );

CREATE TABLE IF NOT EXISTS
  item_respawns (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    item text,
    entity_id bigint
  );

CREATE TABLE IF NOT EXISTS
  weapon_drops (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    steam_id bigint,
    entity_id bigint,
    weapon text
  );

CREATE TABLE IF NOT EXISTS
  item_pickups (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    item text,
    steam_id bigint,
    entity_id bigint
  );

CREATE TABLE IF NOT EXISTS
  medkit_pickups (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    steam_id bigint,
    entity_id bigint,
    hp_before int,
    hp_after int,
    is_big boolean
  );

CREATE TABLE IF NOT EXISTS
  battery_pickups (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    steam_id bigint,
    entity_id bigint,
    armor_before int,
    armor_after int
  );

CREATE TABLE IF NOT EXISTS
  ammo_pickups (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    steam_id bigint,
    ammo_type int,
    count_before int,
    count_after int
  );

CREATE TABLE IF NOT EXISTS
  charger_uses (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    start_tick int,
    start_curtime float,
    end_tick int,
    end_curtime float,
    steam_id bigint,
    entity_id bigint,
    charger_type text,
    origin float[3],
    start_hp int,
    start_ap int,
    end_hp int,
    end_ap int,
    consumed_hp int,
    consumed_ap int
  );

CREATE TABLE IF NOT EXISTS
  projectile_spawns (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    projectile text,
    steam_id bigint,
    entity_id bigint
  );

CREATE TABLE IF NOT EXISTS
  projectile_deaths (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    entity_id bigint,
    killer_entity text,
    killer_entity_id bigint,
    killer_steam_id bigint,
    damage float,
    damage_type int,
    ammo_type int,
    lifetime float,
    distance float
  );

CREATE TABLE IF NOT EXISTS
  projectile_bounces (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    entity_id bigint,
    distance float
  );

CREATE TABLE IF NOT EXISTS
  projectile_owner_changes (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    entity_id bigint,
    prev_owner_steam_id bigint,
    new_owner_steam_id bigint
  );

CREATE TABLE IF NOT EXISTS
  projectile_lifetime_resets (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    origin float[3],
    entity_id bigint,
    prev_lifetime float,
    new_lifetime float
  );

CREATE TABLE IF NOT EXISTS
  entity_teleports (
    id SERIAL PRIMARY KEY,
    match_id uuid REFERENCES matches (id) ON DELETE CASCADE,
    tick int,
    curtime float,
    prev_pos float[3],
    new_pos float[3]
  );