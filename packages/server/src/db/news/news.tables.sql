CREATE TABLE IF NOT EXISTS
  news (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_steam_id bigint,
    title text,
    content text,
    created_on timestamp DEFAULT NOW(),
    published_on timestamp
  );

CREATE TABLE IF NOT EXISTS
  news_read (
    news_id uuid REFERENCES news (id) ON DELETE CASCADE,
    steam_id bigint,
    read_on timestamp DEFAULT NOW(),
    hidden_on timestamp,
    PRIMARY KEY (news_id, steam_id)
  );
