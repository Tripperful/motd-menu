-- Add distance column to player_deaths table if it doesn't exist
ALTER TABLE IF EXISTS player_deaths
ADD COLUMN IF NOT EXISTS distance float;

-- Add client settings columns if they don't exist
ALTER TABLE IF EXISTS client_settings
ADD COLUMN IF NOT EXISTS dsp boolean DEFAULT true,
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
ALTER COLUMN sent_to_efps SET DEFAULT false;

ALTER TABLE IF EXISTS client_connections
ADD COLUMN IF NOT EXISTS server_id int REFERENCES servers (id);