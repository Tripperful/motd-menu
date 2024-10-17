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

CREATE TABLE IF NOT EXISTS
  news_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id uuid REFERENCES news (id) ON DELETE CASCADE,
    author_steam_id bigint,
    content text,
    created_on timestamp DEFAULT NOW()
  );

CREATE TABLE IF NOT EXISTS
  news_comment_reactions (
    comment_id uuid REFERENCES news_comments (id) ON DELETE CASCADE,
    steam_id bigint,
    vote boolean,
    PRIMARY KEY (comment_id, steam_id)
  );