
-- Add demos_url column to servers table if it doesn't exist
ALTER TABLE servers
ADD COLUMN IF NOT EXISTS demos_url text;