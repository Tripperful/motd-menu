-- Index: player_attacks_match_id_idx
-- DROP INDEX IF EXISTS public.player_attacks_match_id_idx;
CREATE INDEX IF NOT EXISTS player_attacks_match_id_idx ON public.player_attacks USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;

-- Index: player_damage_match_id_idx
-- DROP INDEX IF EXISTS public.player_damage_match_id_idx;
CREATE INDEX IF NOT EXISTS player_damage_match_id_idx ON public.player_damage USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;

-- Index: player_deaths_match_id_idx
-- DROP INDEX IF EXISTS public.player_deaths_match_id_idx;
CREATE INDEX IF NOT EXISTS player_deaths_match_id_idx ON public.player_deaths USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;

-- Index: charger_uses_match_id_idx
-- DROP INDEX IF EXISTS public.charger_uses_match_id_idx;
CREATE INDEX IF NOT EXISTS charger_uses_match_id_idx ON public.charger_uses USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;

-- Index: player_respawns_match_id_idx
-- DROP INDEX IF EXISTS public.player_respawns_match_id_idx;
CREATE INDEX IF NOT EXISTS player_respawns_match_id_idx ON public.player_respawns USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;

-- Index: item_pickups_match_id_idx
-- DROP INDEX IF EXISTS public.item_pickups_match_id_idx;
CREATE INDEX IF NOT EXISTS item_pickups_match_id_idx ON public.item_pickups USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;

-- Index: projectile_spawns_match_id_idx
-- DROP INDEX IF EXISTS public.projectile_spawns_match_id_idx;
CREATE INDEX IF NOT EXISTS projectile_spawns_match_id_idx ON public.projectile_spawns USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;

-- Index: projectile_owner_changes_match_id_idx
-- DROP INDEX IF EXISTS public.projectile_owner_changes_match_id_idx;
CREATE INDEX IF NOT EXISTS projectile_owner_changes_match_id_idx ON public.projectile_owner_changes USING btree (match_id ASC NULLS LAST)
WITH
  (deduplicate_items = True) TABLESPACE pg_default;