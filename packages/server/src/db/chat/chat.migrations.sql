ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS is_team_only boolean NOT NULL DEFAULT false;