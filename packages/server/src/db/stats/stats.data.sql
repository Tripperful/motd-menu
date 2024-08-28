DELETE FROM damage_attack_info;
INSERT INTO damage_attack_info (damage_type, weapon, is_secondary, attack_type)
VALUES
  ('crowbar', 'weapon_crowbar', NULL, 'weapon_crowbar'),
  ('stunstick', 'weapon_stunstick', NULL, 'weapon_stunstick'),
  ('physcannon', 'weapon_physcannon', false, 'physics'),
  ('physics', 'weapon_physcannon', false, 'physics'),
  ('pistol', 'weapon_pistol', NULL, 'weapon_pistol'),
  ('357', 'weapon_357', NULL, 'weapon_357'),
  ('smg1', 'weapon_smg1', false, 'weapon_smg1'),
  ('smg1_grenade', 'weapon_smg1', true, 'smg1_grenade'),
  ('ar2', 'weapon_ar2', false, 'weapon_ar2'),
  ('combine_ball', 'weapon_ar2', true, 'combine_ball'),
  ('shotgun', 'weapon_shotgun', NULL, 'weapon_shotgun'),
  ('crossbow', 'weapon_crossbow', NULL, 'weapon_crossbow'),
  ('crossbow_bolt', 'weapon_crossbow', NULL, 'weapon_crossbow'),
  ('frag', 'weapon_frag', NULL, 'grenade_frag'),
  ('grenade_frag', 'weapon_frag', NULL,'grenade_frag'),
  ('rpg', 'weapon_rpg', NULL, 'weapon_rpg'),
  ('rpg_missile', 'weapon_rpg', NULL, 'weapon_rpg'),
  ('slam', 'weapon_slam', NULL, 'slam')