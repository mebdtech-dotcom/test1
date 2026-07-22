-- W3-COMM-1 — the M6 Idempotency-Key replay store (`communication.command_dedup`). Forward-only
-- (Doc-6A §11); M6's OWN schema (One Module, One Owner — no cross-schema reference; no FK).
--
-- FROZEN GROUNDING (the store's realization vehicle — mirrors the ratified `identity.command_dedup`):
--   • Doc-4H §H8 / Doc-5H §7.5: every BC-COMM-4 mutation declares `Idempotency: required` with a
--     client-supplied `Idempotency-Key` + the `communication.idempotency_dedup_window` window; a replay
--     within the window returns the cached original result — no duplicate row, no duplicate audit.
--   • Doc-6A §10.3: "The dedup store (idempotency-key → result/within-window) is realized per the owning
--     module's design — a DEDICATED DEDUP TABLE or a unique idempotency-key column on the target
--     aggregate (realization choice — §2.5), indexed for the window lookup. The window duration is the
--     POLICY key, never a literal."
--   • Doc-5A §9.3: a safe replay returns "the same stored result, the same HTTP status, and the same
--     original reference_id" — fixing the stored-result column set below; §9.3 assigns the dedup
--     MECHANISM/LAYER/WINDOW to development documents — this realization.
--
-- VEHICLE CHOICE [Doc-6A §2.5]: the DEDICATED TABLE is the only §10.3 vehicle that satisfies Doc-5A §9.3
-- (an idempotency-key column on the aggregate cannot store the replayed response, cannot dedup CREATE
-- before its row exists, and would alter the frozen Doc-6H table shapes). The table holds NO domain
-- element (an operational replay cache — Doc-6A R2); NOT a Doc-2 §10.7 entity. Physical specifics
-- (names, types, the scope key) are §2.5 realization choices carrying no Doc-2 authority.
--
-- SCOPE KEY (replay-cache poisoning guard): a cached response is replayable ONLY to the same (contract,
-- acting user, org-context, key) that produced it (Doc-4A §7.5 non-disclosure). NULLS NOT DISTINCT
-- (PostgreSQL 15+) makes the org-less (staff) scope collide correctly. NO FK: an inert operational
-- cache — rows stay valid through actor anonymization (no integrity edge is load-bearing).
--
-- WINDOW: `executed_at` anchors the `communication.idempotency_dedup_window` lookup (Doc-3 v1.5,
-- read via `core.config_value_query.v1`, NEVER a literal). A post-window row is OVERWRITTEN by the next
-- execution (Doc-5A §9.4 — a bounded operational update of a non-authoritative cache; Invariant #8 untouched).

CREATE TABLE "communication"."command_dedup" (
  "id"               uuid        NOT NULL,                        -- [Doc-6A §3.1] PK UUIDv7 (app-side)
  "contract_id"      text        NOT NULL,                        -- the frozen Doc-4H contract id (e.g. comm.create_ticket.v1)
  "actor_user_id"    uuid        NOT NULL,                        -- the acting principal (scope leg; no FK — inert cache)
  "organization_id"  uuid,                                        -- server-resolved org context; NULL for staff scope
  "idempotency_key"  text        NOT NULL,                        -- client-generated opaque key (Doc-5A §9.2; bounded at the wire)
  "response_status"  integer     NOT NULL,                        -- the stored HTTP status (Doc-5A §9.3)
  "response_body"    jsonb       NOT NULL,                        -- the stored §5.6 envelope INCL. the original reference_id (§9.3)
  "response_headers" jsonb,                                       -- stored standard infra headers (e.g. the create `Location`)
  "executed_at"      timestamptz NOT NULL DEFAULT now(),          -- the window anchor (overwritten on post-window re-execution)
  "created_at"       timestamptz NOT NULL DEFAULT now(),          -- [Doc-6A R5]
  "updated_at"       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "communication_command_dedup_pkey" PRIMARY KEY ("id"),
  -- The replay scope key (poisoning guard): one stored response per (contract, actor, org, key).
  -- NULLS NOT DISTINCT so org-less scopes (staff ops) dedup correctly (PG15+).
  CONSTRAINT "communication_command_dedup_scope_key_uq"
    UNIQUE NULLS NOT DISTINCT ("contract_id", "actor_user_id", "organization_id", "idempotency_key")
);

-- RLS (the `identity.command_dedup` idiom; read == write scope → one FOR ALL): a principal touches ONLY
-- its own dedup rows; the staff leg is the platform backstop. App-layer access (the M6 dedup repository)
-- is the authorized path; RLS is defense-in-depth.
ALTER TABLE "communication"."command_dedup" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "command_dedup_actor" ON "communication"."command_dedup" FOR ALL
  USING (
    "actor_user_id" = current_setting('app.user_id', true)::uuid
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  )
  WITH CHECK (
    "actor_user_id" = current_setting('app.user_id', true)::uuid
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  );
