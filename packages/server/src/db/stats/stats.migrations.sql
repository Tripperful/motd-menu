-- Add distance column to player_deaths table if it doesn't exist
ALTER TABLE IF EXISTS player_deaths
ADD COLUMN IF NOT EXISTS distance float;

-- Add client settings columns if they don't exist
ALTER TABLE IF EXISTS client_settings
ADD COLUMN IF NOT EXISTS dsp boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS kevlar_sound boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS magnum_zoom_fov int DEFAULT 0,
ADD COLUMN IF NOT EXISTS crossbow_zoom_fov int DEFAULT 20;

-- Drop the old get_matches function without filters
DROP FUNCTION IF EXISTS get_matches (lmt int, ofst int);

-- Add sent_to_efps column to matches table if it doesn't exist
-- setting all existing matches to true, but changing the default to false
-- so that all new matches aren't considered sent to efps until they are
ALTER TABLE IF EXISTS matches
ADD COLUMN IF NOT EXISTS sent_to_efps boolean DEFAULT true;

ALTER TABLE IF EXISTS matches
ALTER COLUMN sent_to_efps
SET DEFAULT false;

ALTER TABLE IF EXISTS client_connections
ADD COLUMN IF NOT EXISTS server_id int REFERENCES servers (id);

ALTER TABLE IF EXISTS match_team_players
ADD COLUMN IF NOT EXISTS points float DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rank text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rank_pos int DEFAULT NULL;

-- Swap steam_id and entity_id columns in projectile_spawns table
-- if they're the wrong way around
DO $$
BEGIN
  IF (
    SELECT steam_id
    FROM projectile_spawns
    LIMIT 1
) < 1000000 THEN 
  ALTER TABLE projectile_spawns RENAME COLUMN steam_id TO temp_col_name;
  ALTER TABLE projectile_spawns RENAME COLUMN entity_id TO steam_id;
  ALTER TABLE projectile_spawns RENAME COLUMN temp_col_name TO entity_id;
END IF; 
END
$$ 