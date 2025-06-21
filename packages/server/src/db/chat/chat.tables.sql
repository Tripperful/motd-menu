CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    steam_id bigint NOT NULL,
    message text NOT NULL,
    server_id int REFERENCES servers (id) ON DELETE SET NULL,
    team_idx int NOT NULL,
    match_id uuid REFERENCES matches (id) ON DELETE SET NULL,
    created_on timestamp DEFAULT NOW()
); 