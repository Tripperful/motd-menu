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