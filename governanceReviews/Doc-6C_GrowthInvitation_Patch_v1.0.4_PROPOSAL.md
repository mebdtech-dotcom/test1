# Doc-6C — Additive Patch v1.0.4 (Growth Hub: `growth_invitations` + `invitation_conversions`) — M1 `identity` Schema Realization

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive; carried alongside `Doc-6C_SERIES_FROZEN_v1.0` (+ folded patches v1.0.1–v1.0.3) **without editing them in place**. |
| **Version note** | v1.0.4 is the next free number (folded chain = v1.0.1–v1.0.3; verified 2026-07-19). **Contingency:** the parallel Vendor-Buyer-Relationship train carries a planned "Doc-6C count-assertion overlay" in its realization list (`Doc-2_Patch_v1.0.10_VendorBuyerRelationship.md` :183) that is **not yet authored** — if it lands first as v1.0.4, this patch renumbers to v1.0.5 (the Doc-3 v1.12 / Doc-2 v1.0.11 contingency pattern); the Board re-verifies at the fold. |
| **Date** | 2026-07-19 · **Kind** Additive — **3 enums + 2 tables** (Doc-2 §10.2 as amended), intra-schema FKs only, Band-H indexes, GI-2 immutability + append-only triggers, GI-1 atomic-guard placement (service-layer, documented), referrer-org RLS, the §7 slug seed + **count assertion 46 → 47**, POLICY reads bound to `Doc-3_…v1.12_GrowthHub`. **Forward-only, zero backfill.** Coins **no** table/column/state/slug/key/event beyond the Doc-2 v1.0.11 coinage it realizes. |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.1/§A.7 (GI-1/2/3); `Doc-2_Patch_v1.0.11` (the *what* — entities/states/slug); `Doc-3_…v1.12_GrowthHub` (the keys); frozen `Doc-6A` (the *how* — B.1 base model, B.4 naming, §5.2/§5.3 FK rules, §10.2 no-literals, §11 migration); the frozen Doc-6C house grammar (Pass-1…3: `[Doc-2 binding]` vs `[§2.5 choice]` tags, split-RLS pattern, Band-H `WHERE deleted_at IS NULL` indexes); the `core.raise_immutable_violation` trigger precedent (`prisma/migrations/20260627183528_core_init/migration.sql:31` — column-guard via `TG_ARGV`, :205/:215; **empty `TG_ARGV` → DELETE-only block**, :224). |
| **Depends on** | `Doc-2_Patch_v1.0.11` (entities/machines/slug/counts) · `Doc-3_…v1.12_GrowthHub` (keys — **review-clean upstream**) · `Doc-4C_…v1.0.3` (the reading contracts). **Atomic fold.** |

---

## §1 — Enums (3) — `[Doc-2 binding]` state sets verbatim

```sql
CREATE TYPE identity.growth_invitation_state    AS ENUM ('issued', 'expired', 'revoked');          -- [Doc-2 v1.0.11 §2 — machine 5.11]
CREATE TYPE identity.invitation_conversion_state AS ENUM ('started', 'registered');                -- [Doc-2 v1.0.11 §2 — machine 5.12]
CREATE TYPE identity.growth_recipient_type      AS ENUM ('email', 'sms', 'whatsapp', 'link', 'qr'); -- [Doc-2 v1.0.11 §1 — closed code-backed set; `phone`→`sms` ruled]
```

`campaign_key` is deliberately **NOT an enum** (Rec-1 — open text slug; a new campaign = a
`identity.growth_campaign_registry` POLICY entry, never a schema migration).

---

## §2 — `identity.growth_invitations` (the issued artifact — GI-2 immutable core)

```sql
CREATE TABLE identity.growth_invitations (
  id                        uuid NOT NULL,                                   -- [Doc-6A §3.1] PK UUIDv7
  referrer_organization_id  uuid NOT NULL,                                   -- [Doc-2 v1.0.11 §1] tenant/RLS anchor; at-create (GI-2)
  campaign_key              text NOT NULL,                                   -- [Doc-2 v1.0.11 §1] open slug; contract-validated vs identity.growth_campaign_registry (Doc-3 v1.12 key 7) — REFERENCE stage, never a DB enum/FK; at-create (GI-2)
  recipient_type            identity.growth_recipient_type NOT NULL,         -- [Doc-2 v1.0.11 §1] at-create (GI-2)
  recipient_identifier      text,                                            -- [Doc-2 v1.0.11 §1] targeted only; NULL for link/qr; **GI-3 confined** (see §5 read paths); at-create (GI-2)
  token_hash                text NOT NULL,                                   -- [Doc-2 v1.0.11 §1] hash only — the raw token is returned ONCE by create_invitation and never stored; at-create (GI-2)
  max_redemptions           integer,                                         -- [Doc-2 v1.0.11 §1] 1 targeted · NULL open (unbounded); at-create (GI-2)
  redemption_count          integer NOT NULL DEFAULT 0,                      -- [Doc-2 v1.0.11 §1] the GI-1 atomic capacity gate (§4); mutable
  state                     identity.growth_invitation_state NOT NULL DEFAULT 'issued',  -- [Doc-2 §5.11] mutable (issued→expired|revoked)
  expires_at                timestamptz NOT NULL,                            -- [Doc-2 v1.0.11 §1] set in the create service from identity.growth_invite_token_ttl (Doc-3 v1.12) — NOT a DB default literal (Doc-6A §10.2); mutable
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                                          -- [Doc-2 §0.2]
  deleted_at timestamptz, deleted_by uuid, delete_reason text,               -- [Doc-2 §0.2] SD=YES (the §10.2 row)
  CONSTRAINT growth_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT growth_invitations_referrer_fk FOREIGN KEY (referrer_organization_id) REFERENCES identity.organizations(id),  -- [Doc-6A §5.2] intra-schema ONLY
  CONSTRAINT growth_invitations_recipient_chk CHECK (                        -- [§2.5 choice] DB backstop of the Doc-4C §C13 SYNTAX presence rule
    (recipient_type IN ('email','sms','whatsapp') AND recipient_identifier IS NOT NULL)
    OR (recipient_type IN ('link','qr') AND recipient_identifier IS NULL)),
  CONSTRAINT growth_invitations_capacity_chk CHECK (                         -- [§2.5 choice] sanity backstop of GI-1 (the guard itself is §4)
    redemption_count >= 0 AND (max_redemptions IS NULL OR (max_redemptions >= 1 AND redemption_count <= max_redemptions)))
);
CREATE INDEX growth_invitations_referrer_idx ON identity.growth_invitations (referrer_organization_id) WHERE deleted_at IS NULL;  -- [§2.5] Band H (tenant list)
CREATE UNIQUE INDEX growth_invitations_token_hash_live_uq ON identity.growth_invitations (token_hash) WHERE deleted_at IS NULL;   -- [§2.5] resolve-by-token; unique-live (packet §B7)
CREATE INDEX growth_invitations_expiry_idx ON identity.growth_invitations (state, expires_at) WHERE deleted_at IS NULL;           -- [§2.5] the §5.11 expiry sweep (System)
```

**GI-2 immutability trigger** (the frozen `core.raise_immutable_violation` column-guard precedent —
`core_init:31/:205`; the function is **M0 shared-kernel infra**, consumed like `core.allocate_human_ref`
— not a cross-module data access):

```sql
CREATE TRIGGER growth_invitations_block_atcreate_mutation BEFORE UPDATE OR DELETE ON identity.growth_invitations
  FOR EACH ROW EXECUTE FUNCTION core.raise_immutable_violation(
    'referrer_organization_id', 'campaign_key', 'recipient_type',
    'recipient_identifier', 'token_hash', 'max_redemptions',
    'id', 'created_at', 'created_by');
    -- [GI-2] the six ruled at-create columns; state/expires_at/redemption_count + the SD tuple stay mutable
    -- (the function raises only when a LISTED column changes — soft-delete/revoke/GI-1 unaffected, core_init:35-44).
    -- [§2.5 choice] + 'id'/'created_at'/'created_by' (the core_init:205/:215 PK/created guard family precedent — beyond
    -- the GI-2 six, not a GI-2 reinterpretation) and OR DELETE (the :204/:214 precedent shape — hard-DELETE
    -- blocked; removal = soft-delete only, Inv #8). Names = the B.4 `block_` trigger family (F4).
```

---

## §3 — `identity.invitation_conversions` (the attribution record — append-only, Inv #8)

```sql
CREATE TABLE identity.invitation_conversions (
  id                        uuid NOT NULL,                                   -- [Doc-6A §3.1] PK UUIDv7
  growth_invitation_id      uuid NOT NULL,                                   -- [Doc-2 v1.0.11 §1] (at-create = [§2.5 choice], see trigger note)
  referrer_organization_id  uuid NOT NULL,                                   -- [Doc-2 v1.0.11 §1] denormalized tenant anchor — the ONE documented denormalization on-table (RLS anchoring without traversal; Rec-2's justified-denorm rule); (at-create = [§2.5 choice])
  referred_organization_id  uuid,                                            -- [Doc-2 v1.0.11 §1] NULL → set once at registration (the provisionIdentity in-txn bind)
  state                     identity.invitation_conversion_state NOT NULL DEFAULT 'started',  -- [Doc-2 §5.12]
  started_at                timestamptz NOT NULL DEFAULT now(),              -- [Doc-2 v1.0.11 §1]
  registered_at             timestamptz,                                     -- [Doc-2 v1.0.11 §1] set at registration
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                                          -- [Doc-6A B.1] the full base-model tuple — Doc-2 v1.0.11's shorthand lists `created_*` only, but B.1 mandates the tuple for ALL tables and the 5.12 bind mutates the row (Review-A GH6C-7 reconciliation)
  -- NO soft-delete tuple: append-only (Inv #8; the §10.2 row "SD = NO")
  -- NO campaign_key column: derived via growth_invitation_id (Rec-2; the event payload is the one sanctioned denormalized snapshot)
  CONSTRAINT invitation_conversions_pkey PRIMARY KEY (id),
  CONSTRAINT invitation_conversions_invitation_fk FOREIGN KEY (growth_invitation_id)     REFERENCES identity.growth_invitations(id),  -- [Doc-6A §5.2] intra-schema
  CONSTRAINT invitation_conversions_referrer_fk   FOREIGN KEY (referrer_organization_id) REFERENCES identity.organizations(id),
  CONSTRAINT invitation_conversions_referred_fk   FOREIGN KEY (referred_organization_id) REFERENCES identity.organizations(id),
  CONSTRAINT invitation_conversions_state_chk CHECK (                        -- [§2.5 choice] SHAPE-coherence backstop of 5.12 (direction — no registered→started reversal — is service-layer, the Pass-3 §3.9.2 house pattern)
    (state = 'started'    AND referred_organization_id IS NULL     AND registered_at IS NULL)
    OR (state = 'registered' AND referred_organization_id IS NOT NULL AND registered_at IS NOT NULL))
);
CREATE INDEX invitation_conversions_invitation_idx ON identity.invitation_conversions (growth_invitation_id);      -- [§2.5] Band H + the GI-1 reconciliation (COUNT == redemption_count)
CREATE INDEX invitation_conversions_referrer_idx   ON identity.invitation_conversions (referrer_organization_id);  -- [§2.5] Band H (tenant funnel)
CREATE INDEX invitation_conversions_referred_idx   ON identity.invitation_conversions (referred_organization_id);  -- [§2.5] attribution lookup
```

**⛔ NO cross-table partial unique index** — the Board BLOCKER stands realized-by-absence: a
`UNIQUE(growth_invitation_id) WHERE max_redemptions = 1` predicate cannot reference another table's
column (invalid Postgres). Single-use/capacity is the **GI-1 atomic guard** (§4).

**Append-only + at-create triggers** (the two `core.raise_immutable_violation` modes):

```sql
CREATE TRIGGER invitation_conversions_block_atcreate_mutation BEFORE UPDATE ON identity.invitation_conversions
  FOR EACH ROW EXECUTE FUNCTION core.raise_immutable_violation(
    'growth_invitation_id', 'referrer_organization_id', 'started_at',
    'id', 'created_at', 'created_by');
    -- [§2.5 choice] (Review-A GH6C-3) — Doc-2 v1.0.11 marks NO conversions column at-create (GI-2 covers the
    -- six INVITATION columns only); this trio+PK/created guard is an INFERRED hardening derived from
    -- append-only (Inv #8) + the 5.12 one-transition bind (only state/referred_organization_id/registered_at
    -- ever mutate). Not a [Doc-2 binding].
CREATE TRIGGER invitation_conversions_block_delete BEFORE DELETE ON identity.invitation_conversions
  FOR EACH ROW EXECUTE FUNCTION core.raise_immutable_violation();            -- empty TG_ARGV → DELETE-only block (core_init:224); append-only (Inv #8)
```

---

## §4 — GI-1 atomic capacity guard — **placement** (service-layer; the packet §A.7 SQL verbatim)

The guard is **not DDL** — it is the conditional UPDATE inside the **one `provisionIdentity` transaction**
(Board MAJOR-2; `provision-identity.command.ts:110` single `$transaction`), executed **before** the
conversion bind:

```sql
UPDATE identity.growth_invitations
   SET redemption_count = redemption_count + 1
 WHERE id = :invitation_id AND state = 'issued' AND expires_at > now()   -- self-sufficient expiry (verify OBS-1)
   AND (max_redemptions IS NULL OR redemption_count < max_redemptions)
RETURNING id;   -- 0 rows ⇒ expired/exhausted/revoked ⇒ attribution does NOT bind (provisioning still succeeds)
```

Same-row lock semantics serialize concurrent redemptions (EvalPlanQual under READ COMMITTED — the §G
verification). The conversion `registered` bind (`referred_organization_id` + `registered_at` + state)
happens **in the same txn after a non-zero RETURNING**, followed by the `InvitationConverted` outbox
append (same txn — Doc-6A §7.1 write+emit). Reconciliation invariant:
`COUNT(invitation_conversions WHERE registered) == redemption_count` per invitation (a §2.5 operational
check on `invitation_conversions_invitation_idx`, never a constraint).

---

## §5 — RLS (referrer-org tenant)

The two service reads below are the **only cross-tenant READ paths**; the provisioning txn performs the
cross-tenant **writes** under the staff-GUC backstop (Review-B F6 — the packet §B7's "only cross-tenant
paths" shorthand reads precisely this way).

```sql
-- growth_invitations: single-scope tenant (read == write scope → one FOR ALL; the ows/buyer_profiles pattern)
ALTER TABLE identity.growth_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY growth_invitations_tenant ON identity.growth_invitations FOR ALL
  USING      (referrer_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (referrer_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- invitation_conversions: tenant READ only (the referrer's funnel view); writes = STAFF-GUC-ONLY policies
-- (Review-B F1): the provisioning seam does NOT bypass RLS — provision-identity.command.ts:110-113 sets
-- the transaction-local staff GUC (`set_config('app.is_platform_staff','true',true)`) with RLS ENFORCED,
-- and a policy must exist for that GUC to grant anything (the core §2.2 backstop model). Tenants carry no
-- write clause → default-denied; DELETE has no policy at all (and the block_delete trigger stands behind it).
ALTER TABLE identity.invitation_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_conversions_referrer_read ON identity.invitation_conversions FOR SELECT
  USING (referrer_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_conversions_system_insert ON identity.invitation_conversions FOR INSERT
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY invitation_conversions_system_update ON identity.invitation_conversions FOR UPDATE
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
```

**The two cross-tenant read paths (packet §B7) — service-role, app-layer-constrained (GI-3):**

| Path | Runs as | Column allow-list (app layer — the RLS backstop is bypassed by the service role; authz is the app layer per CHK-6-023) |
|---|---|---|
| `identity.resolve_invitation_token.v1` (Public) | service role | resolve by `token_hash` (`growth_invitations_token_hash_live_uq`); reads `state`, `expires_at`, `campaign_key` only → returns `valid` + `campaign_key`-when-valid. **Never `recipient_identifier`, never `referrer_organization_id`, never `token_hash` itself** (anti-oracle; GI-3). |
| `identity.resolve_invitation_delivery_payload.v1` (internal-service, M6) | service (staff-GUC) | resolve by `delivery_reference_id` **via the §10.3-class delivery-reference store (below)** → then reads `recipient_type`, `recipient_identifier`, `state`, `expires_at` (liveness) on the invitation row → the **sole** `recipient_identifier` egress (GI-3 exception; transient, delivery-only). Not-live → the definitive `identity_growth_invite_delivery_not_resolvable` (the reconciled Doc-4C §C13 register). |

**Delivery-reference resolution + signed-URL replay state (Review-A GH6C-1 MAJOR — realized-by-class,
flagged):** no `delivery_reference_id` column exists on either table and **Doc-2 v1.0.11 coins none** —
correctly, because it is not aggregate state: it is **operational service-layer state**, realized per the
owning-module design as a **§10.3-class store** (the exact mechanism CHK-6-072 already sanctions for the
idempotency-dedup store, which itself has no Doc-2 table): a `delivery_reference_id →
growth_invitation_id` entry written by `create_invitation` in the issuing txn (lifetime = the invitation
TTL — the 24h dedup store cannot serve it, Review-B F3), plus the **one-time signed-URL nonce** state
(lifetime = `identity.growth_invite_delivery_url_ttl`; consumed on first redemption — the replay guard).
Non-authoritative, regenerable, never a Doc-2 aggregate, never exposed beyond the two contracts. The
concrete physical shape (dedicated store table vs. keyed rows in the module's operational store) is
**implementation scope under the Doc-4C contract owner — carried as an `[ESC-6-API]`-class flag** for the
fold (CHK-6-073 routing; not fold-blocking: the class, lifetime, and owner are pinned here).

No other read path leaves the referrer-org tenant scope. The **referred** org never reads the invitation
or conversion rows (Q-4 default-anonymous; disclosure, if ever, is a Board ruling — no policy grants it).

---

## §6 — POLICY bindings (Doc-3 `…v1.12_GrowthHub` — read, never literal) + seeds + counts

| Key (Doc-3 v1.12) | Used by (here) |
|---|---|
| `identity.growth_invite_token_ttl` | the create service sets `expires_at` (§2 — no DB default literal) |
| `identity.growth_invite_dedup_window` | `create_invitation` idempotency-dedup store (the §6.1 house model) |
| `identity.growth_invite_quota_window` / `…_quota_max` | `create_invitation` POLICY stage (app layer; no schema artifact) |
| `identity.growth_invite_resolve_rate_limit` | API layer (Doc-4A §19) — no schema artifact |
| `identity.growth_invite_delivery_url_ttl` | the delivery-payload service signs the one-time URL — no schema artifact |
| `identity.growth_campaign_registry` | `create_invitation` REFERENCE-stage validation of `campaign_key` (app layer, reading `core.system_configuration` — M0's store, consumed) |

**Seeds (forward-only, zero backfill):**
1. **Slug seed** — `can_manage_growth_invites` into `identity.permissions` + composition into the O/D/M
   role bundles (indicative defaults, Doc-2 v1.0.11 §3) — the `Doc-6C_Patch_v1.0.1/.3` seed-overlay
   mechanism. **Count assertion 46 → 47** (tenant 37 → 38; staff unchanged 9) — the **v1.0.10 baseline**
   (the folded VBR patch already took 45→46/36→37; `Doc-2_Patch_v1.0.11` §3). *(The VBR train's own
   planned Doc-6C overlay asserts 46 — whichever folds second re-verifies the running total; header
   contingency.)*
2. **POLICY-key seed** — **6 valued** `identity.*` v1.12 keys seeded into `core.system_configuration`
   with the v1.12 proposed start values (Board-adjustable at fold), incl.
   `identity.growth_campaign_registry` = `{ "referral": { "active": true } }`.
   **`identity.growth_invite_resolve_rate_limit` seeds NO value** (Review-A GH6C-2 / Review-B F2 — the
   v1.12 key commits no number, the v1.11 model; the operational value is set via the authorized
   configuration process, never a migration literal). The **2 `billing.*` keys are NOT seeded here** —
   their values are Board-pending (Q-6/Q-12); they seed on the ruling (a follow-up seed, not this
   migration).
3. **No data backfill** — both tables start empty.

**Migration order:** 3 enums → `growth_invitations` (+ CHECKs/FKs) → indexes → GI-2 trigger →
`invitation_conversions` (+ CHECKs/FKs) → indexes → immutable/no-delete triggers → RLS enable +
policies → seeds (slug → bundle composition → POLICY keys). Forward-only, non-destructive (Doc-6A §11).
**Prisma [§2.5]:** `GrowthInvitation` / `InvitationConversion` models, enums
`GrowthInvitationState`/`InvitationConversionState`/`GrowthRecipientType`,
`@@map(...) @@schema("identity")`; intra-schema relations only.

---

## §7 — Flags & carried (none resolved here; nothing coined)

- **`[ESC-6-POLICY]`/`[ESC-6-API]`-class flag — the expiry sweep is DOUBLY unrealized (Review-A GH6C-4
  widened; predicted by Doc-3 v1.12 Review-A OBS-1):** the §5.11 `issued → expired` System sweep runs on
  `growth_invitations_expiry_idx`, but (a) **no cadence key exists**
  (`identity.growth_invite_expiry_sweep_cadence` unregistered — the v1.9 `delegation_expiry_sweep_cadence`
  precedent) **and (b) no executing System contract exists anywhere in the 10-patch set** (the house
  realizes sweeps as named contracts — `expire_delegation_grant`/`expire_invitation`; Doc-4C v1.0.3 coins
  none for 5.11). **Correctness is unaffected** — GI-1, `resolve_invitation_token`, and the
  delivery-payload liveness check read `expires_at` directly (the sweep is state-hygiene, not a gate) —
  so both gaps route together as **one flagged follow-up (additive Doc-3 key + additive Doc-4C System
  contract), not coined here** and not fold-blocking. **The sibling 5.11 edge `revoke` (`issued →
  revoked`, referrer/staff) is likewise executor-less in this set** (Final-Gate L3-M1; flagged in the
  Doc-2 §7 / Doc-4C carried sections — a future additive Doc-4C 21.4 command): this schema is already
  **revoke-ready** (the tenant `FOR ALL` policy covers the state write; `state` is mutable under GI-2) —
  no DDL follows, only the contract.
- **Audit/outbox:** mutations audit via Doc-4B in-txn (`growth_invitation_created` /
  `invitation_converted` — wire tokens = Doc-4C §9); events append to `core.outbox_events` in the same
  txn (Doc-6A §7.1). No event, audit action, or marker coined.
- **Reconciliation-check fold-note (Review-A GH6C-8):** §4's `COUNT(invitation_conversions WHERE
  registered) == redemption_count` refines the packet §A.7's bare `COUNT(conversions)` — equivalent under
  MVP semantics (no persistent `started` rows exist: the sole insert path binds in-txn) and
  future-proof; a prose refinement of an operational check, not the verbatim guard SQL.
- **Mini-attestation (Doc-6A Appendix-A bands, additions only):** CHK-6-001 UUIDv7 PKs ✓ · 6-003
  timestamp/actor tuples ✓ (conversions carry the full B.1 tuple — the §3 reconciliation note) · 6-004 SD
  tuple on `growth_invitations`, none on append-only `invitation_conversions` ✓ · 6-005
  partial-unique-live `token_hash` ✓ · 6-011/6-012/6-013 **no cross-schema FK / no bare cross-module ref
  exists on either table / no traversal** ✓ · 6-020 referrer-org RLS anchor ✓ · 6-023 authz app-layer,
  RLS backstop (incl. the staff-GUC write policies — the real provisioning mechanism) ✓ · 6-030 no
  hard-delete — **DELETE blocked by trigger on BOTH tables** (`…block_atcreate_mutation` OR DELETE +
  `…block_delete`) ✓ · 6-040/6-041 write+emit in-txn, no event coined ✓ · **6-070 Doc-5x/System reads
  persistable** — token-resolve via `growth_invitations_token_hash_live_uq` ✓; delivery-payload via the
  §5 §10.3-class store (carried flag) · **6-072 idempotency/reference stores per the owning-module
  design** ✓ · **6-073 non-persistable → flagged** — the §5 `[ESC-6-API]`-class delivery-store flag +
  the §7 sweep flag are the routings ✓ · 6-060/6-061 v1.12 keys seeded (6 valued; rate-limit
  no-value — v1.11 model) / never literals ✓ · 6-062 seed by pointer, count 47 ✓ · 6-081 physical
  specifics §2.5-tagged (incl. the conversions at-create retag) ✓ · 6-083 `[ESC-6-*]`-class flags routed
  to named channels ✓ · **6-092 trigger/index/constraint names follow the B.4 registry** — the `block_`
  trigger family (Review-B F4), `_pkey/_live_uq/_idx/_fk/_chk` ✓.

**Checklist:** □ no new module · □ no ownership change · □ no governance-signal change · □ **no
cross-schema FK** · □ no cross-module read/JOIN/RLS traversal · □ no frozen doc edited · □ nothing
coined (realizes Doc-2 v1.0.11 + Doc-3 v1.12 verbatim) · □ GI-1 placement documented (service txn; no
cross-table index) · □ GI-2 trigger-enforced · □ GI-3 allow-lists bound · □ forward-only, zero
backfill · □ atomic fold with the 9 sibling patches.
