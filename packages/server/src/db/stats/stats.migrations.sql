-- Change the type of the damage column in the 
-- projectile_deaths table from int to float
DO $$ BEGIN
IF (SELECT pg_typeof(damage)
FROM projectile_deaths
LIMIT 1) = pg_typeof(1::int) THEN
	ALTER TABLE projectile_deaths
		ALTER COLUMN damage
			TYPE float;
END IF;
END;
$$ LANGUAGE plpgsql;

-- Add distance column to player_deaths table if it doesn't exist
ALTER TABLE player_deaths
ADD COLUMN IF NOT EXISTS distance float;

-- Add client settings columns if they don't exist
ALTER TABLE client_settings
ADD COLUMN IF NOT EXISTS dsp boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS magnum_zoom_fov int DEFAULT 0,
ADD COLUMN IF NOT EXISTS crossbow_zoom_fov int DEFAULT 20;

-- Drop the old get_matches function without filters
DROP FUNCTION IF EXISTS get_matches (lmt int, ofst int);

-- Add sent_to_efps column to matches table if it doesn't exist
-- setting all existing matches to true, but changing the default to false
-- so that all new matches aren't considered sent to efps until they are
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS sent_to_efps boolean DEFAULT true;
ALTER TABLE matches
ALTER COLUMN sent_to_efps SET DEFAULT false;