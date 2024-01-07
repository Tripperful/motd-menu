-- Add id column to reviews since we now need
-- to reference them from reactions, alter
-- constraints respectively
DO $$
BEGIN
  IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.columns
  WHERE
    table_name = 'maps_reviews'
    AND column_name = 'id'
) THEN
ALTER TABLE IF EXISTS maps_reviews
  DROP CONSTRAINT IF EXISTS maps_reviews_pkey,
  ADD UNIQUE (map_id, steam_id),
  ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;
END IF;
END
$$