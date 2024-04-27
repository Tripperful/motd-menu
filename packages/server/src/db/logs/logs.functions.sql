CREATE
OR REPLACE PROCEDURE add_log (
  event_type text,
  actor_steam_id bigint,
  event_data json
) AS $$ BEGIN
INSERT INTO logs(event_type, actor_steam_id, event_data)
VALUES (
  add_log.event_type,
  add_log.actor_steam_id,
  add_log.event_data
);
END;
$$ LANGUAGE plpgsql;