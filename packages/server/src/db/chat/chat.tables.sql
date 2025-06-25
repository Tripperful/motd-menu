CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    steam_id bigint NOT NULL,
    message text NOT NULL,
    server_id int REFERENCES servers (id) ON DELETE SET NULL,
    is_team_only boolean NOT NULL DEFAULT false,
    team_idx int NOT NULL,
    match_id uuid REFERENCES matches (id) ON DELETE SET NULL,
    created_on timestamp DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_steam_id ON chat_messages (steam_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_server_id ON chat_messages (server_id);

CREATE TABLE IF NOT EXISTS player_languages (
    steam_id bigint PRIMARY KEY,
    languages json NOT NULL
);