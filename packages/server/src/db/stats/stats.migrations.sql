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
