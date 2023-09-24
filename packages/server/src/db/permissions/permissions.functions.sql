CREATE OR REPLACE PROCEDURE permissions_init (all_permissions json, root_admins json) AS $$ BEGIN
INSERT INTO permissions(code)
VALUES (json_array_elements_text(all_permissions)) ON CONFLICT DO NOTHING;
INSERT INTO players_permissions(steam_id, permission_id)
SELECT VALUE::bigint,
  permissions.id
FROM permissions,
  json_array_elements_text(root_admins) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION user_permissions (steam_id text) RETURNS json AS $$ BEGIN RETURN json_agg(permissions.code)
FROM permissions,
  players_permissions
WHERE players_permissions.steam_id = user_permissions.steam_id::bigint
  AND permissions.id = players_permissions.permission_id;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE grant_permission (steam_id text, code text) AS $$ BEGIN
INSERT INTO players_permissions(steam_id, permission_id)
VALUES (
    grant_permission.steam_id::bigint,
    (
      SELECT permissions.id
      FROM permissions
      WHERE permissions.code = grant_permission.code
      LIMIT 1
    )
  ) ON CONFLICT DO NOTHING;
END; 
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE withdraw_permission (steam_id text, code text) AS $$ BEGIN
DELETE FROM players_permissions
WHERE players_permissions.steam_id = withdraw_permission.steam_id::bigint
  AND players_permissions.permission_id = (
    SELECT permissions.id
    FROM permissions
    WHERE permissions.code = withdraw_permission.code
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;