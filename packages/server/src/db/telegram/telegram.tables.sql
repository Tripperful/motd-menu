CREATE TABLE IF NOT EXISTS
  tg_clients (
    steam_id bigint PRIMARY KEY,
    chat_id bigint,
    client_id bigint
  );