ALTER TABLE maps
ADD COLUMN IF NOT EXISTS parent_id int REFERENCES maps (id);