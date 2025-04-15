-- Add distance column to player_deaths table if it doesn't exist
ALTER TABLE IF EXISTS player_deaths
ADD COLUMN IF NOT EXISTS distance float;

-- Add client settings columns if they don't exist
ALTER TABLE IF EXISTS client_settings
ADD COLUMN IF NOT EXISTS dsp boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS amb boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS bob boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fg boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS kevlar_sound boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS magnum_zoom_fov int DEFAULT 0,
ADD COLUMN IF NOT EXISTS crossbow_zoom_fov int DEFAULT 20,
ADD COLUMN IF NOT EXISTS hitsound_body_path text,
ADD COLUMN IF NOT EXISTS hitsound_head_path text,
ADD COLUMN IF NOT EXISTS killsound_body_path text,
ADD COLUMN IF NOT EXISTS killsound_head_path text,
ADD COLUMN IF NOT EXISTS killsound_teammate_path text;

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

ALTER TABLE IF EXISTS client_custom_ranks
ADD COLUMN IF NOT EXISTS rank_data json DEFAULT NULL,
DROP COLUMN IF EXISTS rank,
DROP COLUMN IF EXISTS color;