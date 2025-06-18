DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE  table_schema = 'public'
    AND table_name = 'client_settings'
  ) THEN
    INSERT INTO client_settings_metadata (setting_id, metadata)
    VALUES
      ('amb',	'{"defaultValue":true,"description":"Ambient soundscapes.","name":"Ambient sounds","section":"General","sortOrder":4,"type":"bool"}'::json),
      ('bob',	'{"defaultValue":true,"description":"More prominent viewmodel bobbing effect when moving.","name":"Viewmodel bobbing","section":"General","sortOrder":6,"type":"bool"}'::json),
      ('bodyHitSound',	'{"category":0,"defaultValue":"sf_vox/hitbody.wav","description":"Sound played when you hit enemy''s body.","name":"Body hit sound","section":"Hit & Kill sounds","sortOrder":14,"type":"sound"}'::json),
      ('crossbowZoomFov',	'{"defaultValue":20,"description":"FOV when using crossbow zoom.","max":70,"min":15,"name":"Crossbow zoom FOV","offValue":0,"onValue":20,"section":"FOV & Zoom","sortOrder":10,"type":"int_toggle"}'::json),
      ('drawViewModel',	'{"defaultValue":true,"description":"Ability to see your weapon in first person view.","name":"Draw view model","section":"General","sortOrder":5,"type":"bool"}'::json),
      ('dsp',	'{"defaultValue":false,"description":"Ear ringing/deafening when you receive explosive damage.","name":"Ear ringing","section":"General","sortOrder":2,"type":"bool"}'::json),
      ('esp',	'{"defaultValue":false,"description":"Ability to see teammates markers through walls.","name":"Show ESP markers","section":"General","sortOrder":1,"type":"bool"}'::json),
      ('fastGathering',	'{"defaultValue":false,"description":"Fast gathering of props with Physcannon by quickly clicking RMB.","name":"Fast gathering","section":"General","sortOrder":7,"type":"bool"}'::json),
      ('fov',	'{"defaultValue":90,"description":"Field of view.","max":110,"min":70,"name":"FOV","section":"FOV & Zoom","sortOrder":8,"type":"int"}'::json),
      ('headHitSound',	'{"category":0,"defaultValue":"sf_vox/hithead.wav","description":"Sound played when you hit enemy''s head.","name":"Head hit sound","section":"Hit & Kill sounds","sortOrder":15,"type":"sound"}'::json),
      ('headKillSound',	'{"category":0,"defaultValue":"sf_vox/headshot_kill_snd.wav","description":"Sound played when you kill an enemy with a headshot.","name":"Head kill sound","section":"Hit & Kill sounds","sortOrder":17,"type":"sound"}'::json),
      ('killSound',	'{"category":0,"defaultValue":"sf_vox/frag_snd.wav","description":"Sound played when you kill an enemy.","name":"Kill sound","section":"Hit & Kill sounds","sortOrder":16,"type":"sound"}'::json),
      ('magnumZoomFov',	'{"defaultValue":0,"description":"FOV when using magnum zoom.","max":70,"min":15,"name":"Magnum zoom FOV","offValue":0,"onValue":30,"section":"FOV & Zoom","sortOrder":9,"type":"int_toggle"}'::json),
      ('playHitSounds',	'{"defaultValue":true,"description":"Play sounds when you deal damage to enemies.","name":"Play hit sounds","section":"Hit & Kill sounds","sortOrder":11,"type":"bool"}'::json),
      ('playKevlarSounds',	'{"defaultValue":true,"description":"Play sounds when you hit enemies with armor.","name":"Play kevlar sounds","section":"Hit & Kill sounds","sortOrder":13,"type":"bool"}'::json),
      ('playKillSounds',	'{"defaultValue":true,"description":"Play sounds when you kill enemies.","name":"Play kill sounds","section":"Hit & Kill sounds","sortOrder":12,"type":"bool"}'::json),
      ('teamKillSound',	'{"category":0,"defaultValue":"sf_vox/tkill.wav","description":"Sound played when you kill a teammate.","name":"Team kill sound","section":"Hit & Kill sounds","sortOrder":18,"type":"sound"}'::json)
    ON CONFLICT (setting_id) DO NOTHING;

    INSERT INTO client_settings_values (steam_id, setting_id, value)
      SELECT steam_id, 'playHitSounds', to_json(hit_sound) FROM client_settings
      UNION ALL
      SELECT steam_id, 'playKillSounds', to_json(kill_sound) FROM client_settings
      UNION ALL
      SELECT steam_id, 'playKevlarSounds', to_json(kevlar_sound) FROM client_settings
      UNION ALL
      SELECT steam_id, 'fov', to_json(fov) FROM client_settings
      UNION ALL
      SELECT steam_id, 'magnumZoomFov', to_json(magnum_zoom_fov) FROM client_settings
      UNION ALL
      SELECT steam_id, 'crossbowZoomFov', to_json(crossbow_zoom_fov) FROM client_settings
      UNION ALL
      SELECT steam_id, 'esp', to_json(esp) FROM client_settings
      UNION ALL
      SELECT steam_id, 'dsp', to_json(dsp) FROM client_settings
      UNION ALL
      SELECT steam_id, 'amb', to_json(amb) FROM client_settings
      UNION ALL
      SELECT steam_id, 'bob', to_json(bob) FROM client_settings
      UNION ALL
      SELECT steam_id, 'fastGathering', to_json(fg) FROM client_settings
      UNION ALL
      SELECT steam_id, 'drawViewModel', to_json(draw_viewmodel) FROM client_settings
      UNION ALL
      SELECT steam_id, 'bodyHitSound', to_json(hitsound_body_path) FROM client_settings WHERE hitsound_body_path IS NOT NULL
      UNION ALL
      SELECT steam_id, 'headHitSound', to_json(hitsound_head_path) FROM client_settings WHERE  hitsound_head_path IS NOT NULL
      UNION ALL
      SELECT steam_id, 'killSound', to_json(killsound_body_path) FROM client_settings WHERE killsound_body_path IS NOT NULL
      UNION ALL
      SELECT steam_id, 'headKillSound', to_json(killsound_head_path) FROM client_settings WHERE killsound_head_path IS NOT NULL
      UNION ALL
      SELECT steam_id, 'teamKillSound', to_json(killsound_teammate_path) FROM client_settings WHERE killsound_teammate_path IS NOT NULL
    ON CONFLICT (steam_id, setting_id) DO NOTHING;

    ALTER TABLE client_settings RENAME TO client_settings_backup;
  END IF;
END;
$$ LANGUAGE plpgsql; 