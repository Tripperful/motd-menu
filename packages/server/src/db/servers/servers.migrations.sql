-- Add demos_url column to servers table if it doesn't exist
ALTER TABLE servers
ADD COLUMN IF NOT EXISTS demos_url text;

-- Add is_dev column to servers table if it doesn't exist
ALTER TABLE servers
ADD COLUMN IF NOT EXISTS is_dev boolean DEFAULT false;