-- W3-MKT-3 — the registered `marketplace.*` POLICY keys seeded into `core.system_configuration`
-- (Doc-3 Patch v1.2 §3 — `marketplace.idempotency_dedup_window`, `marketplace.list_page_size_max`;
-- Doc-3 Patch v1.10 §3 — `marketplace.reserved_subdomain_labels`). Forward-only idempotent DATA
-- migration (Doc-6A §11.3); no DDL. The M1 precedent: `20260710170000_identity_policy_key_seed`.
--
-- REALIZATION PLAN: Doc-6D Pass-3 (§POLICY): "the 2 `marketplace.*` keys … are registered and
-- SEEDED in `core.system_configuration` (M0-owned); M2 READS them, seeds none of its own, coins
-- none (Doc-6A §9)" — this migration is that seed (a data seed in the persistence layer, sanctioned
-- by the frozen realization plan; not cross-module application access). v1.10's reserved-label key
-- is seeded alongside (the W3-MKT-3 slug-issuance gate reads it via `core.config_value_query.v1`).
--
-- KEY FORM (Doc-4A §18.2): the store's natural key is `<domain>.<key_name>`; the M0 reader strips
-- the fixed `core.system_configuration.` reference prefix.
--
-- VALUES: taken VERBATIM from the registration patches' `[start: …]` columns — Doc-3 v1.2 §3
-- (24h duration; 100 integer) and Doc-3 v1.10 §3 (the 54-label reserved start set). None coined;
-- all POLICY (ops-tunable, changes audited per Doc-3 §12.4); none influences a governance signal
-- (Doc-4A §18.3 / §4B firewall). Reserved-label changes are NEVER retroactive (Invariant 8
-- grandfathering — enforced at issuance time in the M2 slug-issuance policy, not here).
--
-- SEED-PK CONVENTION (Board `ESC-SEED-PK-UUID` Option A): deterministic, pre-authored, format-v4
-- UUID constants — never `gen_random_uuid()`. `key` is the natural key; `id` is incidental.
--
-- IDEMPOTENT: `ON CONFLICT (key) DO UPDATE` (re-run safe — Doc-6A §9.5).

INSERT INTO "core"."system_configuration" ("id", "key", "value_jsonb", "value_type") VALUES
  ('2de77a17-0722-4000-8000-000000000001', 'marketplace.idempotency_dedup_window', '"24h"'::jsonb, 'duration'),
  ('2de77a17-0722-4000-8000-000000000002', 'marketplace.list_page_size_max',       '100'::jsonb,   'integer'),
  ('2de77a17-0722-4000-8000-000000000003', 'marketplace.reserved_subdomain_labels',
   '["www","www2","admin","api","app","root","system","support","blog","mail","cdn","static","assets","files","media","img","images","upload","uploads","search","jobs","careers","help","docs","status","dev","staging","test","m","shop","store","account","auth","login","signup","billing","pay","email","smtp","ftp","ns1","ns2","ivendorz","platform","dashboard","ai","api-docs","developer","developers","console","gateway","edge","monitor","metrics"]'::jsonb,
   'string_list')
ON CONFLICT ("key") DO UPDATE
   SET "value_jsonb" = EXCLUDED."value_jsonb",
       "value_type"  = EXCLUDED."value_type",
       "updated_at"  = now();
