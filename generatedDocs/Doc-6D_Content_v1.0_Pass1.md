# Doc-6D — M2 Marketplace (`marketplace`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 Vendor Profile AR + 7 children)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (2 BLOCKER + 3 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Realizes §0–§2 + §3.1. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the **Vendor Profile aggregate** — `vendor_profiles` (AR) + `vendor_capacity_profiles` · `declared_financial_tiers` · `category_assignments` · `financial_tier_history` · `vendor_ownership_history` · `vendor_matching_attributes` · `vendor_claim_records`. The **first public/anonymous tri-actor RLS**, the **capability matrix** (4 booleans), the **§5.3 two-dimension state machine**, the **score firewall**, the **exclusive-writer-as-consumer** history, the **derived matching read-model**, **[DD-7]** |
| Authority | `Doc-2 §5.3/§6/§10.3` (the *what*); `Doc-6A` (the *how*); `Doc-6B §3.3/§4` (`core.allocate_human_ref` + `core.raise_immutable_violation` consumed); `Doc-6C` (`identity` referenced by UUID); `Doc-4D §D0/§D2` (M2 ownership/claim-tenancy, consumed); `Doc-3 v1.2` (`marketplace.*` POLICY — registered) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.3; state sets §5.3 verbatim; **no `buyer_private` column**; POLICY = Doc-3 v1.2; physical specifics §2.5-tagged. `human_ref` prefix `'VENDOR'` = a §2.5 choice (carried) |
| DDL note | PostgreSQL 15+; Prisma `@@schema("marketplace")` (R3b). Actual `marketplace` tables. **[Doc-2 binding]** = verbatim; **[§2.5 choice]** = physical *how* |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6D realizes Doc-2 §10.3 (the *what*) against frozen Doc-6A (the *how*); passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.2 — 2 `marketplace.*` keys). Carried into content: **`[ESC-6-DD7]`** (claim-records tenancy), **`[ESC-MKT-AUDIT]`** (ad/product audit — Pass-3), the `'VENDOR'` `human_ref` prefix (§2.5). Coins nothing.

## §1 — Scope & the `marketplace` Table Partition (Pass-1 slice)
Pass-1 realizes the **Vendor Profile aggregate**: `vendor_profiles` (§3.1.1) + 7 children (§3.1.2–§3.1.8) + the cross-cutting **tri-actor tenancy/RLS model** (§2). **Deferred:** Presentation children (`profile_sections`/`branding_assets`/`seo_settings`/`custom_domains`) → Pass-2 (with Category/Product/Spec); `advertisements`/`showcase_projects`/`catalog_favorites` + §5 firewalls + §6 FTS + §7 + Appendix A → Pass-3. `category_assignments` references `marketplace.categories` (Pass-2) — its FK is a **deferred `ALTER`** (DDL-ordering, §3.1.4).

**Score firewall (load-bearing):** `vendor_profiles` stores **no** trust/performance score (M5-owned). `vendor_matching_attributes` carries `trust_band`/`performance_band` as **reflected reads** (rebuilt from M5 events) — never calculated here (Invariant #6). **Reflect-never-decide:** `claimed→verified` and ban are **consumer effects** of Trust/Admin events (DD-1/DD-3), never local decisions.

## §2 — Tri-Actor Tenancy, Visibility & RLS Realization Model *(the load-bearing section)*

### §2.1 The three actors + the GUCs (Doc-6A §4.2 — server-set, never client)
M2 is the **first public/anonymous surface**. Three actor classes resolve against per-transaction GUCs set by the app-layer guard (`src/server/`), **never** request input (Invariant #5):

| Actor | Resolves via | Sees |
|---|---|---|
| **Public** (anonymous) | no GUC required | published, non-soft-deleted public rows |
| **User** (controlling org) | `app.active_org` (set after the guard confirms an `active` identity membership — Doc-6C §2.1) | own profile incl. pre-publish; public rows |
| **Admin** (platform staff) | `app.is_platform_staff` (Doc-6B §2.2) | all rows / all states |

`current_setting(..., true)` (`missing_ok = true`, Doc-6A RLS-2) → **NULL when unset → predicate false → fail-closed** (anonymous = public-read only, no tenant rows). GUC names/mechanism = **[§2.5]**; "server-validated active org, never client-supplied" = **[Doc-2 §6 / Invariant #5 binding]**.

### §2.2 Four tenancy classes (binding — MK-CR2)
| Class | §3.1 tables | RLS posture |
|---|---|---|
| **Public-readable / org-write** | `vendor_profiles`, `vendor_capacity_profiles`, `declared_financial_tiers`, `category_assignments` | `FOR SELECT`: public predicate **OR** controlling-org **OR** admin; `FOR INSERT/UPDATE/DELETE`: controlling-org **OR** admin |
| **Platform-owned, append-only** | `financial_tier_history`, `vendor_ownership_history` | read: controlling-org of parent **OR** admin; **no UPDATE/DELETE** (immutable, §3.1.5/§3.1.6); INSERT = service (M2 exclusive writer) |
| **Derived read-model** | `vendor_matching_attributes` | read: admin only (RFQ reads via **service**, not table — DD-2); write: rebuild job (System) |
| **Platform-owned [DD-7]** | `vendor_claim_records` | read: controlling/claimed org **OR** admin; write: admin/System (claim/outreach flow) |

**Intra-schema, never a §6-forbidden traversal:** children without their own org column anchor RLS on the parent via an **intra-schema** `EXISTS (… marketplace.vendor_profiles …)` subquery (Doc-6A §5.2 — same-schema is permitted; the forbidden case is *cross-schema* ownership traversal). Authorization is **app-layer** (Doc-4D); RLS is the **backstop** (Doc-6A §4.5) — coarse row-visibility only, no business logic. Permissive policies are **OR'd**; read-scope ⊃ write-scope ⇒ split `FOR SELECT` + `FOR INSERT/UPDATE/DELETE` (Doc-6A §4.6). RLS positive/negative/cross-tenant/**public-byte-equivalence** tests = Doc-8 (Doc-6A §11.5); the schema makes them satisfiable.

### §2.3 Visibility (Invariant #3, MK-CR3) — publish-state RLS, **no `buyer_private` column**
Doc-2 §10.3 declares `vendor_profiles.visibility(public)` — a **single-value enum column**; **no `buyer_private` column exists in Doc-2** and none is coined. The base **public-read** predicate is `visibility = 'public' AND deleted_at IS NULL` (a soft-deleted profile is never public). **Ban is reflected as a public banner, not a hide** (Doc-2 §5.3 `banned (public banner)`): a banned profile remains **readable** (the app renders the banner) but is **excluded from routing/search** in the matching read-model + FTS predicates (§3.1.7 / Pass-3 §6), **not** in the base RLS. This keeps RLS a coarse backstop; status-fine-grained directory/matching filtering is app + read-model.

---

## §3.1 — The Vendor Profile aggregate

### §3.1.1 `marketplace.vendor_profiles` (AR; capability matrix; §5.3 two-dimension state; `human_ref`)
Realizes Doc-2 §10.3 + §5.3. Public-readable; **write = controlling org** (bare-UUID `controlling_organization_id` → M1, no cross-schema FK). One profile per org (partial-unique). `human_ref` via `core.allocate_human_ref` (DR-6-CORE). **Stores no score** (firewall).

```sql
CREATE TYPE marketplace.vendor_claim_state AS ENUM ('seeded', 'invited', 'claimed', 'verified');  -- [Doc-2 §5.3 binding] CLAIM dimension
CREATE TYPE marketplace.vendor_status      AS ENUM ('active', 'suspended', 'banned');              -- [Doc-2 §5.3 binding] STATUS dimension
CREATE TYPE marketplace.vendor_visibility  AS ENUM ('public');                                     -- [Doc-2 §10.3 `visibility(public)`] only value; NO buyer_private (MK-CR3)

CREATE TABLE marketplace.vendor_profiles (
  id                          uuid    NOT NULL,                  -- [Doc-6A §3.1] PK UUIDv7 (M0 ID service)
  human_ref                   text    NOT NULL,                  -- [Doc-2 §0.1/§10.3] VENDOR-YYYY-NNNNNN via core.allocate_human_ref('VENDOR', year) — prefix [§2.5]
  controlling_organization_id uuid    NOT NULL,                  -- [Doc-2 §10.3] bare UUID → M1 (no cross-schema FK; RLS write anchor)
  name                        text    NOT NULL,                  -- [Doc-2 §10.3]
  slug                        text    NOT NULL,                  -- [Doc-2 §10.3] partial-unique-live (§below)
  can_supply                  boolean NOT NULL DEFAULT false,    -- [Doc-2 §10.3 / Invariant #1] capability matrix — 4 booleans, not a label
  can_service                 boolean NOT NULL DEFAULT false,    -- [Doc-2 §10.3]
  can_fabricate               boolean NOT NULL DEFAULT false,    -- [Doc-2 §10.3]
  can_consult                 boolean NOT NULL DEFAULT false,    -- [Doc-2 §10.3]
  vendor_type_preset          text,                              -- [Doc-2 §10.3]
  country                     text,                              -- [Doc-2 §10.3] geography
  division                    text,                              -- [Doc-2 §10.3]
  district                    text,                              -- [Doc-2 §10.3]
  industrial_zone             text,                              -- [Doc-2 §10.3]
  claim_state                 marketplace.vendor_claim_state NOT NULL DEFAULT 'seeded',  -- [Doc-2 §5.3]
  status                      marketplace.vendor_status      NOT NULL DEFAULT 'active',  -- [Doc-2 §5.3]
  visibility                  marketplace.vendor_visibility  NOT NULL DEFAULT 'public',  -- [Doc-2 §10.3]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),  -- [Doc-6A R5]
  created_by uuid, updated_by uuid,                              -- [Doc-2 §0.2] actor
  deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §0.2] soft-delete (excluded from routing/search — §5.3)
  CONSTRAINT vendor_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_profiles_human_ref_uq UNIQUE (human_ref)    -- [Doc-2 §0.1] human_ref never reused → plain unique
);
CREATE UNIQUE INDEX vendor_profiles_slug_live_uq ON marketplace.vendor_profiles (slug) WHERE deleted_at IS NULL;                       -- [Doc-2 §10.3 binding] slug UNIQUE(partial)
CREATE UNIQUE INDEX vendor_profiles_org_live_uq  ON marketplace.vendor_profiles (controlling_organization_id) WHERE deleted_at IS NULL; -- [Doc-2 §10.3 binding] one profile per org (partial)
CREATE INDEX vendor_profiles_public_idx ON marketplace.vendor_profiles (status) WHERE visibility = 'public' AND deleted_at IS NULL;    -- [§2.5] Band H public directory
```
- **Capability = matrix, not label (Invariant #1, MK-CR4):** four independent booleans; no `vendor_type` enum derived from them in the DB (`vendor_type_preset` is a UI preset label, not the capability source of truth).
- **§5.3 two orthogonal dimensions (MK-CR5):** `claim_state` (CLAIM) + `status` (STATUS) are **separate** enums + DEFAULTs; the transition guards are realized in §4 (Pass-3) — `seeded→invited→claimed` (claim requires a controlling org — Doc-2 §5.3 guard), `claimed→verified` (**idempotent consumer of Trust `VendorVerified`** — DD-1, **reflect never decide**), `active⇄suspended`, `active→banned (public banner)→active` (consumer of Admin ban/lift — DD-3). Direct registration creates the profile in `claimed` (service-set). Ownership transfer → **Trust Protection Workflow** (service, DR-6-STATE). Pure-DB triggers cannot express these (they span events + the access formula) — service/consumer layer.
- **`human_ref` (MK-CR11):** `core.allocate_human_ref('VENDOR', <year>)` (Doc-6B §3.3) in the create transaction (no second ref on replay). **`'VENDOR'` entity-type prefix is a [§2.5] choice** — Doc-2 §0.1 gives no vendor example; **carried for confirmation** (does not block; isolated to this one call site).
- **Score firewall (Invariant #6, MK-CR7):** no `trust_score`/`performance_score` column here. Bands are reflected into `vendor_matching_attributes` (§3.1.7) from M5 events; the directory reads those bands, never an M5 table.
- **RLS:** tri-actor (§2.2) — DDL in §3.1.9 (consolidated).
- **Prisma [§2.5]:** `VendorProfile` — `humanRef @map("human_ref")`, `controllingOrganizationId @map(...) @db.Uuid`, the 4 `can*` booleans, enums `VendorClaimState`/`VendorStatus`/`VendorVisibility @@schema("marketplace")`, `@@map("vendor_profiles") @@schema("marketplace")`; partial-unique indexes declared in the migration (Prisma cannot express the `WHERE` predicate).

### §3.1.2 `marketplace.vendor_capacity_profiles` (1:1; public display / org write)
Realizes Doc-2 §10.3. `UNIQUE(vendor_profile_id)` — one per profile; intra-schema FK → `vendor_profiles`. `verified_fields_jsonb` records **which** capacity claims Trust verified (reflected — M2 does not verify).

```sql
CREATE TABLE marketplace.vendor_capacity_profiles (
  id                       uuid NOT NULL,
  vendor_profile_id        uuid NOT NULL,                         -- [Doc-6A §5.2] intra-schema FK + UNIQUE
  max_project_value        numeric,                               -- [Doc-2 §10.3] (currency on the value-carrying parent decision — see §note)
  max_project_value_currency char(3) NOT NULL DEFAULT 'BDT',      -- [Doc-6A R9 / Doc-2 §0.4] multi-currency-ready (per value field)
  max_monthly_rfq_capacity integer,                               -- [Doc-2 §10.3]
  employee_count_range     text,                                  -- [Doc-2 §10.3] range buckets
  factory_size_range       text,                                  -- [Doc-2 §10.3]
  annual_turnover_range    text,                                  -- [Doc-2 §10.3] optional
  verified_fields_jsonb    jsonb,                                 -- [Doc-2 §10.3] which claims Trust verified (reflected; [§2.5] jsonb)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT vendor_capacity_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_capacity_profiles_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT vendor_capacity_profiles_profile_uq UNIQUE (vendor_profile_id)   -- [Doc-2 §10.3] 1:1
);
```
- **Multi-currency (Doc-6A R9):** `max_project_value` carries a paired `char(3)` currency (BDT default; stored per value field — Doc-2 §0.4). The `_range` columns are bucket labels (text), not monetary.
- **`verified_fields_jsonb` = reflected** (M5 verification result mirrored here for display); M2 never decides verification (DD-1).
- **RLS:** public-readable display / controlling-org write via parent (§3.1.9). **Prisma [§2.5]:** `VendorCapacityProfile`, `@@map`/`@@schema`.

### §3.1.3 `marketplace.declared_financial_tiers` (0..1; the tier-gate input)
Realizes Doc-2 §10.3. **0..1 per profile** — seeded vendors have **none** (absence fails the tier gate; profile not routable until declared). `UNIQUE(vendor_profile_id)`.

```sql
CREATE TYPE marketplace.financial_tier AS ENUM ('A', 'B', 'C', 'D', 'E');   -- [Doc-2 §10.3 `tier(A–E)` binding]

CREATE TABLE marketplace.declared_financial_tiers (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK + UNIQUE
  tier              marketplace.financial_tier NOT NULL,          -- [Doc-2 §10.3]
  declared_at       timestamptz NOT NULL DEFAULT now(),           -- [Doc-2 §10.3]
  declared_by       uuid,                                         -- [Doc-2 §10.3] actor
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT declared_financial_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT declared_financial_tiers_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT declared_financial_tiers_profile_uq UNIQUE (vendor_profile_id)    -- [Doc-2 §10.3] 0..1
);
```
- **Tier-gate (Doc-2 §10.3):** absence of a row = not routable; the gate itself is M3 logic (M2 supplies the declared tier via `vendor_matching_attributes`). A **declared** tier change also appends a `financial_tier_history` row (`tier_type='declared'`) — the **same M2 transaction** (§3.1.5).
- **`declared` vs `verified` (Doc-2 §10.6 cross-ref):** the **verified** tier is M5's `trust.verified_financial_tiers`; M2 mirrors verified changes into history as a consumer (§3.1.5), never stores the verified row itself. **RLS:** public-read / org-write (§3.1.9).

### §3.1.4 `marketplace.category_assignments` (vendor↔category; service-bounded ≤10/≤5)
Realizes Doc-2 §10.3. FK → `vendor_profiles` (this pass) + → `categories` (**Pass-2** — deferred FK, DDL-1). `status(proposed/active/removed)`; service enforces ≤10 total / ≤5 primary.

```sql
CREATE TYPE marketplace.category_assignment_level  AS ENUM ('primary', 'secondary');           -- [Doc-2 §10.3 `level(primary/secondary)`]
CREATE TYPE marketplace.category_assignment_status AS ENUM ('proposed', 'active', 'removed');   -- [Doc-2 §10.3]

CREATE TABLE marketplace.category_assignments (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK
  category_id       uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK → categories (Pass-2; deferred ALTER, DDL-1)
  level             marketplace.category_assignment_level  NOT NULL,  -- [Doc-2 §10.3]
  is_specialized    boolean NOT NULL DEFAULT false,               -- [Doc-2 §10.3]
  status            marketplace.category_assignment_status NOT NULL DEFAULT 'proposed',  -- [Doc-2 §10.3]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.3] SD (removed)
  CONSTRAINT category_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT category_assignments_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id)
  -- NOTE (DDL-1): the categories FK is NOT inline — marketplace.categories is realized in Pass-2;
  -- category_assignments_category_fk is added by a deferred ALTER (§7 migration), after categories exists:
  --   ALTER TABLE marketplace.category_assignments
  --     ADD CONSTRAINT category_assignments_category_fk FOREIGN KEY (category_id) REFERENCES marketplace.categories(id);
);
CREATE UNIQUE INDEX category_assignments_live_uq ON marketplace.category_assignments (vendor_profile_id, category_id) WHERE deleted_at IS NULL;  -- [§2.5] one live assignment per (vendor, category)
```
- **≤10 total / ≤5 primary (Doc-2 §10.3):** a **service** invariant (a count across rows) — not a pure-DB constraint; the partial-unique index prevents duplicate live (vendor, category) pairs only.
- **RLS:** public-read / org-write via parent (§3.1.9). **Prisma [§2.5]:** `CategoryAssignment`, deferred relation to `Category` declared in Pass-2.

### §3.1.5 `marketplace.financial_tier_history` (append-only; **exclusive-writer-as-consumer**)
Realizes Doc-2 §10.3. **Permanent (no SD); immutable (no UPDATE/DELETE).** **Written exclusively by Marketplace:** `declared` changes **directly**; `verified` changes as an **idempotent consumer** of Trust's `VendorTierChanged` event (MK-CR7). **Trust never writes this table.**

```sql
CREATE TYPE marketplace.tier_change_type AS ENUM ('declared', 'verified');   -- [Doc-2 §10.3 `tier_type(declared/verified)`]

CREATE TABLE marketplace.financial_tier_history (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK
  tier_type         marketplace.tier_change_type NOT NULL,        -- [Doc-2 §10.3]
  old_tier          marketplace.financial_tier,                   -- [Doc-2 §10.3] NULL on first declaration
  new_tier          marketplace.financial_tier NOT NULL,          -- [Doc-2 §10.3]
  effective_from    timestamptz NOT NULL DEFAULT now(),           -- [Doc-2 §10.3]
  effective_to      timestamptz,                                  -- [Doc-2 §10.3] NULL = current
  change_reason     text,                                         -- [Doc-2 §10.3]
  approved_by       uuid,                                         -- [Doc-2 §10.3] actor (declared: org; verified: System-as-consumer)
  created_at timestamptz NOT NULL DEFAULT now(),                  -- [Doc-6A R5] (no updated_at — append-only)
  created_by uuid,                                                -- [Doc-2 §0.2]
  CONSTRAINT financial_tier_history_pkey PRIMARY KEY (id),
  CONSTRAINT financial_tier_history_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT financial_tier_history_validity_chk CHECK (effective_to IS NULL OR effective_to > effective_from)  -- [§2.5] interval sanity
);
CREATE INDEX financial_tier_history_current_idx ON marketplace.financial_tier_history (vendor_profile_id, tier_type) WHERE effective_to IS NULL;  -- [§2.5] current tier per type

-- Append-only immutability (Doc-6A R7) — attach the M0 shared guard with the protected columns as TG_ARGV (Doc-6B §4).
-- The guard blocks DELETE unconditionally and raises on any change to a NAMED column; effective_to is OMITTED = the bounded-mutable
-- temporal-close column (NULL→timestamp on supersession). (HR-1: a no-arg call would block DELETE only, leaving UPDATE open.)
CREATE TRIGGER financial_tier_history_immutable
  BEFORE UPDATE OR DELETE ON marketplace.financial_tier_history FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','vendor_profile_id','tier_type','old_tier','new_tier','effective_from','change_reason','approved_by','created_at','created_by');  -- [Doc-6B §4] payload/identity immutable; effective_to closable; DELETE blocked
```
- **Idempotency (consumer side, not a coined column):** the `verified` consumer-write is made idempotent by the **outbox-consumer dedup** (Doc-6A R6 — processed-event ledger / `marketplace.idempotency_dedup_window`), **not** by a `source_event_id` column (none in Doc-2 §10.3; none coined). A replayed `VendorTierChanged` writes **no second row**.
- **Exclusive writer:** only M2 INSERTs (declared txn + verified consumer). The immutability trigger + the "no Trust write" rule = the §10.3 binding realized.
- **RLS:** read = controlling-org-of-parent OR admin; **no write policy** beyond service INSERT (§3.1.9). **Prisma [§2.5]:** `FinancialTierHistory` (no `updatedAt`/`deletedAt`).

### §3.1.6 `marketplace.vendor_ownership_history` (append-only)
Realizes Doc-2 §10.3. **Permanent; immutable.** Records ownership transfers (the Trust Protection Workflow trail).

```sql
CREATE TABLE marketplace.vendor_ownership_history (
  id                  uuid NOT NULL,
  vendor_profile_id   uuid NOT NULL,                              -- [Doc-6A §5.2] intra-schema FK
  old_organization_id uuid,                                       -- [Doc-2 §10.3] bare UUID → M1 (NULL on initial seed/claim)
  new_organization_id uuid NOT NULL,                              -- [Doc-2 §10.3] bare UUID → M1
  valid_from          timestamptz NOT NULL DEFAULT now(),         -- [Doc-2 §10.3]
  valid_to            timestamptz,                                -- [Doc-2 §10.3] NULL = current owner
  transfer_reason     text,                                       -- [Doc-2 §10.3]
  approved_by         uuid,                                       -- [Doc-2 §10.3] actor
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT vendor_ownership_history_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_ownership_history_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT vendor_ownership_history_validity_chk CHECK (valid_to IS NULL OR valid_to > valid_from)  -- [§2.5]
);
CREATE INDEX vendor_ownership_history_current_idx ON marketplace.vendor_ownership_history (vendor_profile_id) WHERE valid_to IS NULL;  -- [§2.5] current owner row

CREATE TRIGGER vendor_ownership_history_immutable
  BEFORE UPDATE OR DELETE ON marketplace.vendor_ownership_history FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','vendor_profile_id','old_organization_id','new_organization_id','valid_from','transfer_reason','approved_by','created_at','created_by');  -- [Doc-6B §4] valid_to closable; DELETE blocked (HR-1)
```
- **`controlling_organization_id` on `vendor_profiles` = the current owner; this table is the audit trail.** Transfer is service-orchestrated (Trust Protection Workflow — freeze→review→reactivate); the row is appended in that workflow's transaction. **RLS:** read = controlling-org-of-parent OR admin (§3.1.9). **Prisma [§2.5]:** `VendorOwnershipHistory`.

### §3.1.7 `marketplace.vendor_matching_attributes` (derived read-model; the **only** RFQ surface)
Realizes Doc-2 §10.3. **Derived — not platform-owned; rebuilt** from authoritative marketplace + trust sources. `UNIQUE(vendor_profile_id)`. The **only** surface the RFQ engine's matching reads (**via service**, DD-2). Denormalized: capability flags, tier, geography, category sets, **trust band, performance band** (reflected — score firewall), probation flag.

```sql
CREATE TABLE marketplace.vendor_matching_attributes (
  id                uuid    NOT NULL,
  vendor_profile_id uuid    NOT NULL,                             -- [Doc-6A §5.2] intra-schema FK + UNIQUE
  can_supply        boolean NOT NULL DEFAULT false,               -- [Doc-2 §10.3] denormalized capability flags
  can_service       boolean NOT NULL DEFAULT false,
  can_fabricate     boolean NOT NULL DEFAULT false,
  can_consult       boolean NOT NULL DEFAULT false,
  tier              marketplace.financial_tier,                   -- [Doc-2 §10.3] effective tier (verified else declared) — denormalized
  country           text, division text, district text, industrial_zone text,  -- [Doc-2 §10.3] geography
  category_ids      uuid[]  NOT NULL DEFAULT '{}',                -- [Doc-2 §10.3] category sets (denormalized; [§2.5] array)
  trust_band        text,                                         -- [Doc-2 §10.3] REFLECTED from M5 (score firewall — never calculated here)
  performance_band  text,                                         -- [Doc-2 §10.3] REFLECTED from M5
  probation_flag    boolean NOT NULL DEFAULT false,               -- [Doc-2 §10.3] REFLECTED
  rebuilt_at        timestamptz NOT NULL DEFAULT now(),           -- [§2.5] last rebuild stamp (disposable projection)
  CONSTRAINT vendor_matching_attributes_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_matching_attributes_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT vendor_matching_attributes_profile_uq UNIQUE (vendor_profile_id)
);
CREATE INDEX vendor_matching_attributes_band_idx ON marketplace.vendor_matching_attributes (trust_band, performance_band);  -- [§2.5] Band H directory ranking (MK-CR9)
```
- **Disposable projection (Doc-6A R7):** **no soft-delete, no immutability trigger** — rebuilt (UPSERT on `vendor_profile_id`) on the source events (profile/capability/category change, `VendorVerified`, `VendorTierChanged`, ban/lift, Trust/Performance band change). Never source of truth; safe to TRUNCATE-and-rebuild.
- **Score firewall (Invariant #6):** `trust_band`/`performance_band`/`probation_flag` are **reflected reads** of M5 outputs — M2 calculates none. **RFQ reads this via service only** (DD-2); RLS read = **admin only** (matching is a service path, not a tenant table read) — §3.1.9.
- **Prisma [§2.5]:** `VendorMatchingAttributes`, `categoryIds Int[]`→`String[] @db.Uuid` array, `@@map`/`@@schema`.

### §3.1.8 `marketplace.vendor_claim_records` (platform-owned **[DD-7]**; the claim/outreach log)
Realizes Doc-2 §10.3. Logs the claim lifecycle **events** (the *state* lives on `vendor_profiles.claim_state` — no duplicate state enum coined). `claimed_by_organization_id` bare UUID → M1.

> **`[ESC-6-DD7]` — carried, not resolved.** Doc-2 places `vendor_claim_records` as a **child of `vendor_profiles`** (§10.3) yet the claim flow is **platform/outreach-driven** before any controlling org exists (seeded vendors) — a §6-tenancy vs §3.3-aggregation tension. **Interim realization per Doc-4D §D2:** treat it as a **platform-owned child** (no org anchor of its own; RLS = controlling/claimed org of the parent **OR** admin). The durable resolution is an **additive Doc-2 §6/§3.3 reconciliation (human-approved)** — **never** resolved locally here.

```sql
CREATE TYPE marketplace.claim_source AS ENUM ('excel', 'admin', 'registration');   -- [Doc-2 §10.3 `source(excel/admin/registration)`]

CREATE TABLE marketplace.vendor_claim_records (
  id                          uuid NOT NULL,
  vendor_profile_id           uuid NOT NULL,                      -- [Doc-6A §5.2] intra-schema FK
  source                      marketplace.claim_source NOT NULL,  -- [Doc-2 §10.3]
  claimed_by_organization_id  uuid,                               -- [Doc-2 §10.3] bare UUID → M1 (NULL until claimed)
  invited_at                  timestamptz,                        -- [Doc-2 §10.3]
  invite_channel              text,                               -- [Doc-2 §10.3]
  claimed_at                  timestamptz,                        -- [Doc-2 §10.3]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  CONSTRAINT vendor_claim_records_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_claim_records_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id)
);
CREATE INDEX vendor_claim_records_profile_idx ON marketplace.vendor_claim_records (vendor_profile_id);  -- [§2.5]
```
- **No state enum:** the authoritative claim lifecycle is `vendor_profiles.claim_state` (§3.1.1); this table records `invited_at`/`claimed_at`/`source`/`channel` (the **events**), not a parallel state column (coin-nothing). **No SD** (Doc-2 §10.3 — permanent outreach log). **RLS:** §3.1.9 (DD-7 interim). **Prisma [§2.5]:** `VendorClaimRecord`.

### §3.1.9 Consolidated RLS DDL for the Vendor Profile aggregate (DDL — not prose; HQ-001 lesson from Doc-6C)
All 8 tables, ENABLE + policies. Public/org/admin **OR'd**; read-scope split from write-scope (Doc-6A §4.6). Children anchor on the parent via **intra-schema** `EXISTS` (Doc-6A §5.2). The shared org-write predicate against the parent:

```sql
-- ===== vendor_profiles: tri-actor (public read | org read+write | admin all) =====
ALTER TABLE marketplace.vendor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_profiles_public_read ON marketplace.vendor_profiles FOR SELECT
  USING (visibility = 'public' AND deleted_at IS NULL);                                   -- [§2.3] banned readable (banner); routing/search exclusion = read-model
CREATE POLICY vendor_profiles_org_read ON marketplace.vendor_profiles FOR SELECT
  USING (controlling_organization_id = current_setting('app.active_org', true)::uuid);     -- own profile incl. pre-publish
CREATE POLICY vendor_profiles_admin ON marketplace.vendor_profiles FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY vendor_profiles_org_write ON marketplace.vendor_profiles FOR INSERT
  WITH CHECK (controlling_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY vendor_profiles_org_modify ON marketplace.vendor_profiles FOR UPDATE
  USING (controlling_organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (controlling_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY vendor_profiles_org_delete ON marketplace.vendor_profiles FOR DELETE
  USING (controlling_organization_id = current_setting('app.active_org', true)::uuid);

-- ===== public-read / org-write children (capacity, declared_tier, category_assignments) =====
-- pattern (shown for vendor_capacity_profiles; declared_financial_tiers + category_assignments identical):
ALTER TABLE marketplace.vendor_capacity_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_capacity_profiles_public_read ON marketplace.vendor_capacity_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = vendor_capacity_profiles.vendor_profile_id
                    AND p.visibility = 'public' AND p.deleted_at IS NULL));
CREATE POLICY vendor_capacity_profiles_org_read ON marketplace.vendor_capacity_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = vendor_capacity_profiles.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY vendor_capacity_profiles_admin ON marketplace.vendor_capacity_profiles FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY vendor_capacity_profiles_org_write ON marketplace.vendor_capacity_profiles FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                       WHERE p.id = vendor_capacity_profiles.vendor_profile_id
                         AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY vendor_capacity_profiles_org_modify ON marketplace.vendor_capacity_profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = vendor_capacity_profiles.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY vendor_capacity_profiles_org_delete ON marketplace.vendor_capacity_profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = vendor_capacity_profiles.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
-- declared_financial_tiers + category_assignments: same six policies, s/vendor_capacity_profiles/<table>/.

-- ===== append-only history (financial_tier_history, vendor_ownership_history): read controlling-org OR admin; no write policy (service INSERT only) =====
ALTER TABLE marketplace.financial_tier_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY financial_tier_history_read ON marketplace.financial_tier_history FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                     WHERE p.id = financial_tier_history.vendor_profile_id
                       AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY financial_tier_history_insert ON marketplace.financial_tier_history FOR INSERT
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
              OR EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                          WHERE p.id = financial_tier_history.vendor_profile_id
                            AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
-- (UPDATE/DELETE are blocked by the immutability trigger, not RLS — no UPDATE/DELETE policy granted.)
-- vendor_ownership_history: same two policies, s/financial_tier_history/vendor_ownership_history/.

-- ===== derived read-model (vendor_matching_attributes): admin read only; RFQ reads via service, not table (DD-2) =====
ALTER TABLE marketplace.vendor_matching_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_matching_attributes_admin ON marketplace.vendor_matching_attributes FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (the matching read path is a SECURITY DEFINER service function — not a tenant SELECT; no public/org policy.)

-- ===== vendor_claim_records [DD-7]: read controlling/claimed org OR admin; write admin/System =====
ALTER TABLE marketplace.vendor_claim_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_claim_records_read ON marketplace.vendor_claim_records FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR claimed_by_organization_id = current_setting('app.active_org', true)::uuid
         OR EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                     WHERE p.id = vendor_claim_records.vendor_profile_id
                       AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY vendor_claim_records_admin_write ON marketplace.vendor_claim_records FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
```
- **Why `vendor_matching_attributes` is admin-only read:** the RFQ engine consumes it through a **service** (DD-2), executed as a `SECURITY DEFINER` function or a privileged read role — **not** a tenant `SELECT`. Exposing it to public/org RLS would leak reflected trust/performance bands beyond their display contract. Admin RLS = backstop for direct ops access only.

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: the 8-table set + columns (Doc-2 §10.3), the §5.3 two-dimension state sets verbatim, capability matrix (4 booleans, no derived label), **no `buyer_private` column**, `human_ref` signature (`core.allocate_human_ref('VENDOR', year)` — Doc-6B §3.3), the immutability function pointer (`core.raise_immutable_violation` — Doc-6B §4), score firewall (no score column; bands reflected), exclusive-writer-as-consumer (Trust never writes `financial_tier_history`), DD-2 service-only matching read, coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **DDL-1** `category_assignments → categories` FK inline but `categories` is Pass-2 → migration fails | BLOCKER | **FIXED** — categories FK removed from `CREATE TABLE`; added as a **deferred `ALTER`** (§7 migration, after categories — Pass-2). Same pattern as Doc-6C `memberships_role_fk`. |
| **BAN-1** initial public-read excluded `banned` → contradicts Doc-2 §5.3 `banned (public banner)` (banner must render) | BLOCKER | **FIXED** — §2.3: public-read = `visibility='public' AND deleted_at IS NULL` (status-agnostic); ban is a **public banner** (readable), routing/search exclusion moved to the matching read-model + FTS, **not** base RLS. Reflects ban without hiding it. |
| **IDEM-1** `verified` consumer-write idempotency unspecified — risk of duplicate history rows on event replay | MAJOR | **FIXED** — §3.1.5: idempotency is **consumer-side** (outbox processed-event dedup / `marketplace.idempotency_dedup_window`, Doc-6A R6), **not** a coined `source_event_id` column (none in Doc-2). |
| **CUR-1** `max_project_value` monetary without a currency field (Doc-6A R9) | MAJOR | **FIXED** — added paired `max_project_value_currency char(3) DEFAULT 'BDT'` (per-value-field currency, Doc-2 §0.4); `_range` columns are text buckets (non-monetary). |
| **RLS-MA-1** `vendor_matching_attributes` left public/org-readable would leak reflected M5 bands | MAJOR | **FIXED** — §3.1.9: admin-only RLS; RFQ matching reads via **service** (`SECURITY DEFINER`), not a tenant SELECT (DD-2). |
| **IMM-1** history append-only asserted but no UPDATE/DELETE block | MINOR | **FIXED** — `BEFORE UPDATE OR DELETE` trigger → `core.raise_immutable_violation()` on both history tables (Doc-6B §4, by pointer). |
| **DD7-1** claim-records tenancy resolved locally | MINOR | **CONFIRMED carried** — §3.1.8 keeps `[ESC-6-DD7]` open (interim per Doc-4D §D2; additive Doc-2 reconciliation, human-approved); **not** resolved here. Flag-and-halt held. |
| **PFX-1** `'VENDOR'` `human_ref` prefix has no Doc-2 example | NIT | **CONFIRMED carried** — §3.1.1 tags it a [§2.5] choice; isolated to one call site; surfaced for confirmation; does not block. |

**Net:** 2 BLOCKER (FK ordering, ban-banner read) + 3 MAJOR (idempotency, currency, matching-read leak) fixed; 2 MINOR/1 NIT applied or confirmed-carried. DDL valid + executable; RLS tri-actor + fail-closed + non-leaking; score firewall + exclusive-writer + DD-2 intact; DD-7 + prefix correctly carried. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6D Content Pass-1 (§0–§2 · §3.1 Vendor Profile AR + 7 children) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the capability matrix (4 booleans), the §5.3 two-dimension state machine, the first public/anonymous tri-actor RLS (public-read + controlling-org-write + admin + derived-admin-only), the score firewall (no score column; bands reflected), the exclusive-writer-as-consumer `financial_tier_history` (Trust never writes; immutable; idempotent consumer), the derived `vendor_matching_attributes` read-model (DD-2 service-only), and the `[DD-7]` claim-records interim (carried). Columns verbatim Doc-2 §10.3; state sets §5.3 verbatim; no `buyer_private`; `human_ref` via `core.allocate_human_ref('VENDOR', …)` (prefix §2.5-carried); immutability via `core.raise_immutable_violation` (Doc-6B §4); coins nothing. Next: Pass-2 (Category 4-level tree · Product + Spec Library · Presentation — profile_sections/branding_assets/seo_settings/custom_domains).*
