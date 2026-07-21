-- Doc-6C — Additive Patch v1.0.4 (Growth Hub) — M1 `identity` Schema Realization —
-- `identity_growth_hub` (forward-only; Doc-6A §11). P1 Growth Hub M1 core slice.
--
-- Realizes (DDL transcribed VERBATIM from `generatedDocs/Doc-6C_GrowthInvitation_Patch_v1.0.4.md`,
-- Board-APPROVED + FOLDED 2026-07-19 — one of the 10-patch `GrowthHub_P0_Additive_Patch_Set` v1.4):
--   §1 — 3 enums (Doc-2 v1.0.10 §2 machines 5.11/5.12 + the closed recipient-type set)
--   §2 — identity.growth_invitations (the issued artifact — GI-2 immutable core) + indexes + trigger
--   §3 — identity.invitation_conversions (the attribution record — append-only, Inv #8) + triggers
--   §5 — referrer-org RLS (split policies; staff-GUC write legs) — the §6.2a GUC idiom verbatim
--   §6 — seeds: the `can_manage_growth_invites` slug + O/D/M bundle composition (count 46 → 47;
--        tenant 37 → 38, staff unchanged 9 — the Doc-2 v1.0.10 §3 assertion on the v1.0.9 baseline)
--        + the 6 VALUED `identity.*` POLICY keys of `Doc-3_…v1.14_GrowthHub`.
-- PLUS the flagged `[ESC-6-API]` §10.3-class OPERATIONAL delivery-reference store
-- (`identity.invitation_delivery_refs` — Doc-6C v1.0.4 §5 "delivery-reference resolution" block:
-- service-layer state, NOT a Doc-2 aggregate; the CHK-6-072 idempotency-store class).
--
-- The GI-1 atomic capacity guard is NOT DDL (Doc-6C v1.0.4 §4 — it is the conditional UPDATE inside
-- the one `provisionIdentity` transaction; realized in `provision-identity.command.ts`). The GI-2
-- immutability trigger consumes the M0 shared-kernel function `core.raise_immutable_violation`
-- (`core_init` :31 — consumed like `core.allocate_human_ref`, not a cross-module data access).
-- Forward-only, zero backfill; both aggregate tables start empty (Doc-6C v1.0.4 §6).
--
-- NOTE: `[Doc-2 binding]` = column/type/constraint verbatim from Doc-2 v1.0.10 / Doc-6C v1.0.4;
--       `[§2.5 choice]` = physical realization tagged as such in the folded patch.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6C v1.0.4 §1) — `[Doc-2 binding]` state sets verbatim
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE identity.growth_invitation_state    AS ENUM ('issued', 'expired', 'revoked');          -- [Doc-2 v1.0.10 §2 — machine 5.11]
CREATE TYPE identity.invitation_conversion_state AS ENUM ('started', 'registered');                -- [Doc-2 v1.0.10 §2 — machine 5.12]
CREATE TYPE identity.growth_recipient_type      AS ENUM ('email', 'sms', 'whatsapp', 'link', 'qr'); -- [Doc-2 v1.0.10 §1 — closed code-backed set; `phone`→`sms` ruled]

-- `campaign_key` is deliberately NOT an enum (Doc-6C v1.0.4 §1 / Rec-1 — open text slug; a new
-- campaign = a `identity.growth_campaign_registry` POLICY entry, never a schema migration).

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) identity.growth_invitations (Doc-6C v1.0.4 §2 — the issued artifact; GI-2 immutable core)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE identity.growth_invitations (
  id                        uuid NOT NULL,                                   -- [Doc-6A §3.1] PK UUIDv7
  referrer_organization_id  uuid NOT NULL,                                   -- [Doc-2 v1.0.10 §1] tenant/RLS anchor; at-create (GI-2)
  campaign_key              text NOT NULL,                                   -- [Doc-2 v1.0.10 §1] open slug; contract-validated vs identity.growth_campaign_registry (Doc-3 v1.14 key 7) — REFERENCE stage, never a DB enum/FK; at-create (GI-2)
  recipient_type            identity.growth_recipient_type NOT NULL,         -- [Doc-2 v1.0.10 §1] at-create (GI-2)
  recipient_identifier      text,                                            -- [Doc-2 v1.0.10 §1] targeted only; NULL for link/qr; GI-3 confined (§5 read paths); at-create (GI-2)
  token_hash                text NOT NULL,                                   -- [Doc-2 v1.0.10 §1] hash only — the raw token is returned ONCE by create_invitation and never stored; at-create (GI-2)
  max_redemptions           integer,                                         -- [Doc-2 v1.0.10 §1] 1 targeted · NULL open (unbounded); at-create (GI-2)
  redemption_count          integer NOT NULL DEFAULT 0,                      -- [Doc-2 v1.0.10 §1] the GI-1 atomic capacity gate (service-layer, §4); mutable
  state                     identity.growth_invitation_state NOT NULL DEFAULT 'issued',  -- [Doc-2 §5.11] mutable (issued→expired|revoked)
  expires_at                timestamptz NOT NULL,                            -- [Doc-2 v1.0.10 §1] set in the create service from identity.growth_invite_token_ttl (Doc-3 v1.14) — NOT a DB default literal (Doc-6A §10.2); mutable
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                                          -- [Doc-2 §0.2]
  deleted_at timestamptz, deleted_by uuid, delete_reason text,               -- [Doc-2 §0.2] SD=YES (the §10.2 row)
  CONSTRAINT growth_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT growth_invitations_referrer_fk FOREIGN KEY (referrer_organization_id) REFERENCES identity.organizations(id),  -- [Doc-6A §5.2] intra-schema ONLY
  CONSTRAINT growth_invitations_recipient_chk CHECK (                        -- [§2.5 choice] DB backstop of the Doc-4C §C13 SYNTAX presence rule
    (recipient_type IN ('email','sms','whatsapp') AND recipient_identifier IS NOT NULL)
    OR (recipient_type IN ('link','qr') AND recipient_identifier IS NULL)),
  CONSTRAINT growth_invitations_capacity_chk CHECK (                         -- [§2.5 choice] sanity backstop of GI-1 (the guard itself is §4 — service-layer)
    redemption_count >= 0 AND (max_redemptions IS NULL OR (max_redemptions >= 1 AND redemption_count <= max_redemptions)))
);
CREATE INDEX growth_invitations_referrer_idx ON identity.growth_invitations (referrer_organization_id) WHERE deleted_at IS NULL;  -- [§2.5] Band H (tenant list)
CREATE UNIQUE INDEX growth_invitations_token_hash_live_uq ON identity.growth_invitations (token_hash) WHERE deleted_at IS NULL;   -- [§2.5] resolve-by-token; unique-live (packet §B7)
CREATE INDEX growth_invitations_expiry_idx ON identity.growth_invitations (state, expires_at) WHERE deleted_at IS NULL;           -- [§2.5] the §5.11 expiry sweep (System — executor-less in this set; Doc-6C v1.0.4 §7 flagged follow-up)

-- GI-2 immutability trigger (the frozen `core.raise_immutable_violation` column-guard precedent —
-- `core_init:31/:205`): the six ruled at-create columns + the PK/created guard family; OR DELETE
-- blocks hard-DELETE (removal = soft-delete only, Inv #8). state/expires_at/redemption_count + the
-- SD tuple stay mutable (soft-delete/revoke/GI-1 unaffected).
CREATE TRIGGER growth_invitations_block_atcreate_mutation BEFORE UPDATE OR DELETE ON identity.growth_invitations
  FOR EACH ROW EXECUTE FUNCTION core.raise_immutable_violation(
    'referrer_organization_id', 'campaign_key', 'recipient_type',
    'recipient_identifier', 'token_hash', 'max_redemptions',
    'id', 'created_at', 'created_by');

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) identity.invitation_conversions (Doc-6C v1.0.4 §3 — append-only attribution record, Inv #8)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE identity.invitation_conversions (
  id                        uuid NOT NULL,                                   -- [Doc-6A §3.1] PK UUIDv7
  growth_invitation_id      uuid NOT NULL,                                   -- [Doc-2 v1.0.10 §1] (at-create = [§2.5 choice], see trigger note)
  referrer_organization_id  uuid NOT NULL,                                   -- [Doc-2 v1.0.10 §1] denormalized tenant anchor — the ONE documented denormalization on-table (RLS anchoring without traversal; Rec-2)
  referred_organization_id  uuid,                                            -- [Doc-2 v1.0.10 §1] NULL → set once at registration (the provisionIdentity in-txn bind)
  state                     identity.invitation_conversion_state NOT NULL DEFAULT 'started',  -- [Doc-2 §5.12]
  started_at                timestamptz NOT NULL DEFAULT now(),              -- [Doc-2 v1.0.10 §1]
  registered_at             timestamptz,                                     -- [Doc-2 v1.0.10 §1] set at registration
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                                          -- [Doc-6A B.1] full base-model tuple (Review-A GH6C-7 reconciliation)
  -- NO soft-delete tuple: append-only (Inv #8; the §10.2 row "SD = NO")
  -- NO campaign_key column: derived via growth_invitation_id (Rec-2; the event payload is the one sanctioned denormalized snapshot)
  CONSTRAINT invitation_conversions_pkey PRIMARY KEY (id),
  CONSTRAINT invitation_conversions_invitation_fk FOREIGN KEY (growth_invitation_id)     REFERENCES identity.growth_invitations(id),  -- [Doc-6A §5.2] intra-schema
  CONSTRAINT invitation_conversions_referrer_fk   FOREIGN KEY (referrer_organization_id) REFERENCES identity.organizations(id),
  CONSTRAINT invitation_conversions_referred_fk   FOREIGN KEY (referred_organization_id) REFERENCES identity.organizations(id),
  CONSTRAINT invitation_conversions_state_chk CHECK (                        -- [§2.5 choice] SHAPE-coherence backstop of 5.12 (direction is service-layer)
    (state = 'started'    AND referred_organization_id IS NULL     AND registered_at IS NULL)
    OR (state = 'registered' AND referred_organization_id IS NOT NULL AND registered_at IS NOT NULL))
);
CREATE INDEX invitation_conversions_invitation_idx ON identity.invitation_conversions (growth_invitation_id);      -- [§2.5] Band H + the GI-1 reconciliation (COUNT == redemption_count)
CREATE INDEX invitation_conversions_referrer_idx   ON identity.invitation_conversions (referrer_organization_id);  -- [§2.5] Band H (tenant funnel)
CREATE INDEX invitation_conversions_referred_idx   ON identity.invitation_conversions (referred_organization_id);  -- [§2.5] attribution lookup

-- ⛔ NO cross-table partial unique index (Doc-6C v1.0.4 §3 — the Board BLOCKER stands
-- realized-by-absence: a predicate cannot reference another table's column). Single-use/capacity is
-- the GI-1 atomic guard (§4 — service-layer).

-- Append-only + at-create triggers (the two `core.raise_immutable_violation` modes):
CREATE TRIGGER invitation_conversions_block_atcreate_mutation BEFORE UPDATE ON identity.invitation_conversions
  FOR EACH ROW EXECUTE FUNCTION core.raise_immutable_violation(
    'growth_invitation_id', 'referrer_organization_id', 'started_at',
    'id', 'created_at', 'created_by');
    -- [§2.5 choice] (Review-A GH6C-3) — INFERRED hardening from append-only (Inv #8) + the 5.12
    -- one-transition bind (only state/referred_organization_id/registered_at ever mutate). Not a [Doc-2 binding].
CREATE TRIGGER invitation_conversions_block_delete BEFORE DELETE ON identity.invitation_conversions
  FOR EACH ROW EXECUTE FUNCTION core.raise_immutable_violation();            -- empty TG_ARGV → DELETE-only block (core_init:224); append-only (Inv #8)

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) identity.invitation_delivery_refs — the §10.3-class OPERATIONAL store (Doc-6C v1.0.4 §5
--     "delivery-reference resolution" block). NOT a Doc-2 aggregate — service-layer state (the
--     CHK-6-072 idempotency-store class). In P1 the store holds ONLY the
--     `delivery_reference_id → growth_invitation_id` MAPPING written by `create_invitation` in
--     the issuing txn — NO token material of any kind. "Only `token_hash` is stored — the raw
--     token is returned ONCE and never stored" (Doc-2 v1.0.10 §1 / Doc-6C v1.0.4 §2) therefore
--     holds ABSOLUTELY in P1. The token-material + one-time signed-URL nonce +
--     `identity.growth_invite_delivery_url_ttl` TTL legs are DEFERRED to the ruled secure-store
--     design landing with the M6 delivery consumer (P2) — a Board-recorded carry: the
--     `[ESC-6-API]` flag covers the store's PHYSICAL SHAPE only; the folded Doc-4C v1.0.3 §C13 +
--     Doc-3 v1.14 pin the signed-URL semantics, which P1 does NOT fake.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE identity.invitation_delivery_refs (
  delivery_reference_id uuid NOT NULL,                                       -- [§2.5] PK UUIDv7 (operational key; rides the InvitationIssued payload)
  growth_invitation_id  uuid NOT NULL,                                       -- [§2.5] intra-schema ref to the issued artifact
  created_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invitation_delivery_refs_pkey PRIMARY KEY (delivery_reference_id),
  CONSTRAINT invitation_delivery_refs_invitation_fk FOREIGN KEY (growth_invitation_id) REFERENCES identity.growth_invitations(id)  -- [Doc-6A §5.2] intra-schema
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) RLS (Doc-6C v1.0.4 §5 — referrer-org tenant; GUC casts verbatim from the frozen §6.2a idiom,
--     `20260709100000_identity_authz`). App-layer authz is primary; RLS is the row backstop
--     (CHK-6-023). The provisioning txn performs the cross-tenant writes under the staff-GUC
--     backstop (Review-B F6 — `set_config('app.is_platform_staff','true',true)`, RLS ENFORCED).
-- ─────────────────────────────────────────────────────────────────────────────

-- growth_invitations: single-scope tenant (read == write scope → one FOR ALL; the ows/buyer_profiles pattern)
ALTER TABLE identity.growth_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY growth_invitations_tenant ON identity.growth_invitations FOR ALL
  USING      (referrer_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (referrer_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- invitation_conversions: tenant READ only (the referrer's funnel view); writes = STAFF-GUC-ONLY
-- policies (Review-B F1): the provisioning seam does NOT bypass RLS — it sets the transaction-local
-- staff GUC, and a policy must exist for that GUC to grant anything (the core §2.2 backstop model).
-- Tenants carry no write clause → default-denied; DELETE has no policy at all (block_delete stands behind it).
ALTER TABLE identity.invitation_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_conversions_referrer_read ON identity.invitation_conversions FOR SELECT
  USING (referrer_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_conversions_system_insert ON identity.invitation_conversions FOR INSERT
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_conversions_system_update ON identity.invitation_conversions FOR UPDATE
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- invitation_delivery_refs: NO tenant read/write — service-only (the GI-3 confinement: the store
-- is delivery plumbing, never a tenant surface). Staff-GUC-only SELECT + INSERT; no UPDATE/DELETE
-- policy (default-denied). The issuing service leg + the M6 delivery-payload read both run under
-- the staff-GUC service context.
ALTER TABLE identity.invitation_delivery_refs ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_delivery_refs_service_read ON identity.invitation_delivery_refs FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_delivery_refs_service_insert ON identity.invitation_delivery_refs FOR INSERT
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- (6a) Slug seed (Doc-6C v1.0.4 §6 seed 1) — `can_manage_growth_invites` into identity.permissions
--      + composition into the O/D/M system bundles (indicative defaults, Doc-2 v1.0.10 §3).
--      COUNT ASSERTION: catalog 46 → **47** (tenant 37 → **38**; staff unchanged 9) — the v1.0.9
--      baseline (the folded VBR patch took 45→46/36→37; Doc-2 v1.0.10 §3).
--
-- SEED-PK CONVENTION (Board `ESC-SEED-PK-UUID` Option A, 2026-07-10 — packet
-- `governanceReviews/BOARD-PACKET-SEED-PK-UUID_v1.0.md`): hand-authored DETERMINISTIC format-v4
-- UUID constant (NEVER `gen_random_uuid()`/runtime-random); the natural key is `slug`, on which the
-- upsert keys. Continues the `20260710160000_identity_routing_slugs_seed` constant series.
-- IDEMPOTENT: `ON CONFLICT (slug) DO UPDATE` (re-run safe — Doc-6A §11.3). System-actor authored
-- (created_by/updated_by NULL — the seed house pattern).
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "identity"."permissions" ("id", "slug", "description", "space") VALUES
  ('1de77a17-05c9-4000-8000-000000000003', 'can_manage_growth_invites',
   'Growth invitations — create/manage the org''s growth invites (Doc-2 §7 as patched Doc-2_Patch_v1.0.10 §3)',
   'tenant')
ON CONFLICT ("slug") DO UPDATE SET description = EXCLUDED.description, space = EXCLUDED.space, updated_at = now();

-- O/D/M bundle composition (Doc-2 v1.0.10 §3 indicative defaults — Owner/Director/Manager; Officer
-- NOT mapped). `organization_id` NULL = system-bundle composition (Doc-6C §5.2 / DC-CR2).
-- Idempotent: composite PK conflict → DO NOTHING (the `identity_catalog_seed` §2 mechanics verbatim).
INSERT INTO "identity"."role_permissions" ("role_id", "permission_id", "organization_id")
SELECT r."id", p."id", NULL
FROM (VALUES
  ('can_manage_growth_invites','Owner'),('can_manage_growth_invites','Director'),('can_manage_growth_invites','Manager')
) AS m("slug", "role_name")
JOIN "identity"."permissions" p ON p."slug" = m."slug"
JOIN "identity"."roles" r ON r."name" = m."role_name" AND r."organization_id" IS NULL AND r."is_system_bundle" = true AND r."deleted_at" IS NULL
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- (6b) POLICY-key seed (Doc-6C v1.0.4 §6 seed 2) — the 6 VALUED `identity.*` keys of
--      `Doc-3_Policy_Key_Registration_Patch_v1.14_GrowthHub` into `core.system_configuration`
--      (M0's store — a sanctioned persistence-layer data seed, the `20260710170000` precedent; NOT
--      cross-module application access). Key form `<domain>.<key_name>` (Doc-4A §18.2); values are
--      read live via `core.config_value_query.v1`, NEVER literals (Doc-6A §10.2).
--
-- DELIBERATELY NOT SEEDED HERE:
--   • `identity.growth_invite_resolve_rate_limit` — REGISTERED, NO value committed (Review-A
--     GH6C-2 / Review-B F2 — the v1.11 `PublicReadRateLimit` model; the operational value is set
--     via the authorized configuration process, never a migration literal).
--   • the 2 `billing.*` growth keys — values Board-pending (Q-6/Q-12); they seed on the ruling
--     (a follow-up seed, not this migration).
--
-- SEED-PK CONVENTION: deterministic format-v4 constants continuing the `1de77a17-0901-…` POLICY-seed
-- series (rows 08–13). IDEMPOTENT: `ON CONFLICT (key) DO UPDATE` (Doc-6A §9.5); `updated_by` NULL.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "core"."system_configuration" ("id", "key", "value_jsonb", "value_type") VALUES
  ('1de77a17-0901-4000-8000-000000000008', 'identity.growth_invite_dedup_window',      '"24h"'::jsonb, 'duration'),
  ('1de77a17-0901-4000-8000-000000000009', 'identity.growth_invite_token_ttl',         '"30d"'::jsonb, 'duration'),
  ('1de77a17-0901-4000-8000-000000000010', 'identity.growth_invite_quota_window',      '"30d"'::jsonb, 'duration'),
  ('1de77a17-0901-4000-8000-000000000011', 'identity.growth_invite_quota_max',         '100'::jsonb,   'count (integer)'),
  ('1de77a17-0901-4000-8000-000000000012', 'identity.growth_invite_delivery_url_ttl',  '"15m"'::jsonb, 'duration'),
  ('1de77a17-0901-4000-8000-000000000013', 'identity.growth_campaign_registry',        '{"referral":{"active":true}}'::jsonb, 'json (map)')
ON CONFLICT ("key") DO UPDATE
   SET "value_jsonb" = EXCLUDED."value_jsonb",
       "value_type"  = EXCLUDED."value_type",
       "updated_at"  = now();
