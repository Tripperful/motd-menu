-- Add parent map ID for grouping different versions
-- of the same map
ALTER TABLE IF EXISTS maps
ADD COLUMN IF NOT EXISTS parent_id int REFERENCES maps (id);