# Doc-6D — M2 Marketplace (`marketplace`) Schema Realization — Content v1.0 **Pass-3** (§3.5 Advertisement · §3.6 Showcase · §3.7 Catalog Favorite · §4 State · §5 Firewalls · §6 FTS · §7 Migration · §8 + Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 (FINAL) — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Completes §3.5–§3.7 + §4–§8 + Appendix A. Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | **Advertisement** (`advertisements` — §5.8 state machine) · **Showcase** (`showcase_projects`) · **Catalog Favorite** (`catalog_favorites` — polymorphic, no FK); the **§4 state-machine** consolidation; the **§5 cross-module firewalls** (DD-1…DD-5); the **§6 first-real-FTS**; the **§7 forward-only migration**; **§8 + Appendix A** (Doc-6A `CHK-6-001…093`, 37 checks) |
| Authority | `Doc-2 §5.8/§8/§10.3` (the *what*); `Doc-6A` (the *how* + Appendix A gate); `Doc-6B §3.3/§4` (core consumed); `Doc-4D/4L/4M` (events/state, consumed); `Doc-3 v1.2` (`marketplace.*` POLICY); `Doc-5D` (read/list cross-check) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.3; `advertisements.status` = §5.8 verbatim; **no `showcase_projects.status` enum** (Doc-2 lists none); physical specifics §2.5-tagged. Carried: `[ESC-MKT-AUDIT]`, `[ESC-6-DD7]`, `[ESC-6-SCHEMA-SHOWCASE]`, `'VENDOR'` prefix (§2.5) |
| DDL note | PostgreSQL 15+; Prisma `@@schema("marketplace")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.5 — `marketplace.advertisements` (§5.8 state machine; billing by reference)
Realizes Doc-2 §10.3 + §5.8. FK → `vendor_profiles` (**optional** — landing ads target no vendor); `purchaser_organization_id` + `platform_invoice_id` bare UUID (no cross-schema FK); `placement, creative_ref, schedule, status(§5.8)`; public when active; SD.

```sql
CREATE TYPE marketplace.ad_placement AS ENUM ('landing', 'bottom', 'search', 'vendor_profile');                      -- [Doc-2 §10.3 binding]
CREATE TYPE marketplace.ad_status    AS ENUM ('draft', 'pending_review', 'scheduled', 'active', 'paused', 'completed', 'rejected');  -- [Doc-2 §5.8 binding]

CREATE TABLE marketplace.advertisements (
  id                      uuid NOT NULL,
  vendor_profile_id       uuid,                                  -- [Doc-2 §10.3] optional → vendor_profiles (intra-schema; nullable for landing ads)
  purchaser_organization_id uuid NOT NULL,                       -- [Doc-2 §10.3] bare UUID → M1 identity.organizations (the purchasing org — ADV-PURCH)
  platform_invoice_id     uuid,                                  -- [Doc-2 §10.3] bare UUID → M7 billing.platform_invoices (purchase; DD-5)
  placement               marketplace.ad_placement NOT NULL,     -- [Doc-2 §10.3]
  creative_ref            text,                                  -- [Doc-2 §10.3] storage ref
  schedule_start          timestamptz,                           -- [Doc-2 §10.3 `schedule`] window start ([§2.5] start/end realize "schedule")
  schedule_end            timestamptz,                           -- [Doc-2 §10.3 `schedule`] window end (§5.8 "end date")
  status                  marketplace.ad_status NOT NULL DEFAULT 'draft',  -- [Doc-2 §5.8]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT advertisements_pkey PRIMARY KEY (id),
  CONSTRAINT advertisements_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT advertisements_schedule_chk CHECK (schedule_end IS NULL OR schedule_start IS NULL OR schedule_end > schedule_start)  -- [§2.5]
);
CREATE INDEX advertisements_active_idx ON marketplace.advertisements (placement, status) WHERE status = 'active' AND deleted_at IS NULL;  -- [§2.5] Band H serving
CREATE INDEX advertisements_purchaser_idx ON marketplace.advertisements (purchaser_organization_id) WHERE deleted_at IS NULL;             -- [§2.5]
```
- **§5.8 state (MK-CR6):** `draft→pending_review→(approve)scheduled→(start date)active`; `pending_review→(reject)rejected`; `active⇄paused`; `active→(end date/budget)completed`. Enum + DEFAULT; transitions = service (the `scheduled→active`/`active→completed` date edges are a **System timer**, the window bounds in `schedule_start/end`; budget exhaustion is M7-signalled). The **review/approve/reject audit** = **`[ESC-MKT-AUDIT]`** (ad moderation actions absent from Doc-2 §9 → bind nearest §9 action by pointer at audit time; **none invented**).
- **Billing by reference (DD-5):** ad purchase is a `billing.platform_invoice` (M7); `platform_invoice_id` is a bare UUID read, no FK, no `billing` table access. The creative/placement lifecycle lives here; the money lives in M7. **Platform never handles buyer↔vendor money** — this is the platform's **own** ad revenue (M7), not a buyer↔vendor flow.
- **RLS:** public when `active` (within schedule) / purchaser-org write / admin review (§3.x). **Prisma [§2.5]:** `Advertisement`, enums `AdPlacement`/`AdStatus`.

## §3.6 — `marketplace.showcase_projects` (portfolio; `[ESC-6-SCHEMA-SHOWCASE]`)
Realizes Doc-2 §10.3. FK → `vendor_profiles`; public; SD. Doc-2 describes only **"portfolio entries"** — **no column list, no status**.

> **`[ESC-6-SCHEMA-SHOWCASE]` — carried (corpus underspecification, not resolved locally).** Doc-2 §10.3 gives `showcase_projects` as "portfolio entries" with **no enumerated columns and no status**. Inventing business columns (title/value/completed_at/status) would **coin**. **Interim realization:** base columns + a single `content_jsonb` content carrier (the same disposable-content pattern Doc-2 uses for `profile_sections.content_json`) + presentation ordering. The durable column set is bound when **Doc-4D §D2 / Doc-5D** pins the showcase DTO, or via an **additive Doc-2** entry — **never** invented here. **No `status` enum** (Doc-2 lists none; the structure's "draft→published" shorthand = service-visibility over `is_visible`, not a coined column).

```sql
CREATE TABLE marketplace.showcase_projects (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK
  display_order     integer NOT NULL DEFAULT 0,                   -- [§2.5] presentation ordering (interim)
  is_visible        boolean NOT NULL DEFAULT true,                -- [§2.5] visibility flag (interim — no Doc-2 status)
  content_jsonb     jsonb,                                        -- [§2.5 / ESC-6-SCHEMA-SHOWCASE] portfolio content carrier until DTO pinned
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT showcase_projects_pkey PRIMARY KEY (id),
  CONSTRAINT showcase_projects_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id)
);
CREATE INDEX showcase_projects_profile_order_idx ON marketplace.showcase_projects (vendor_profile_id, display_order) WHERE deleted_at IS NULL;  -- [§2.5]
```
- **Anti-coining discipline:** only `content_jsonb` (+ presentation flags) is realized; the typed portfolio columns are **deferred to the DTO source**, not guessed. **RLS:** public-read (parent public) / org write (§3.x). **Prisma [§2.5]:** `ShowcaseProject`.

## §3.7 — `marketplace.catalog_favorites` (polymorphic; **no FK on target**; tenant-owned)
Realizes Doc-2 §10.3. `organization_id` (tenant; bare UUID → M1, the favoriting org); `target_type(product/category), target_id` — **polymorphic, no foreign keys**, validated through service contracts. SD. **CRM vendor-favorites are M4's** (`operations.vendor_favorites`) — not here.

```sql
CREATE TYPE marketplace.favorite_target AS ENUM ('product', 'category');   -- [Doc-2 §10.3 `target_type(product/category)`]

CREATE TABLE marketplace.catalog_favorites (
  id              uuid NOT NULL,
  organization_id uuid NOT NULL,                                  -- [Doc-2 §6/§10.3] tenant RLS anchor (bare UUID → M1)
  target_type     marketplace.favorite_target NOT NULL,          -- [Doc-2 §10.3]
  target_id       uuid NOT NULL,                                 -- [Doc-2 §10.3] polymorphic — NO FK (service-validated)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT catalog_favorites_pkey PRIMARY KEY (id)
  -- NO FK on (target_type, target_id) — polymorphic reference, validated through service contracts (Doc-2 §10.3 binding)
);
CREATE UNIQUE INDEX catalog_favorites_live_uq ON marketplace.catalog_favorites (organization_id, target_type, target_id) WHERE deleted_at IS NULL;  -- [§2.5] one live favorite per (org, target)
CREATE INDEX catalog_favorites_org_idx ON marketplace.catalog_favorites (organization_id) WHERE deleted_at IS NULL;  -- [§2.5]
```
- **Polymorphic, no FK (Doc-2 §10.3):** the target's existence is **service-validated** (target_type drives the lookup to `products`/`categories`); the absence of an FK is the **binding**, not an omission — a polymorphic column cannot carry a single-target FK. Intra-schema, but deliberately FK-free.
- **Tenant-owned RLS:** `organization_id = active_org` (the **only** plain `organization_id`-anchored table in `marketplace` — most M2 tenancy anchors on `controlling_organization_id`). **CRM scope fence:** vendor-favorites (a buyer's private vendor list) are **M4**, non-disclosure — never here. **Prisma [§2.5]:** `CatalogFavorite`, enum `FavoriteTarget`.

## §3.x — Consolidated RLS DDL (Pass-3 tables)
```sql
-- ===== advertisements: public when active | purchaser-org write | admin review =====
ALTER TABLE marketplace.advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY advertisements_public_read ON marketplace.advertisements FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);
CREATE POLICY advertisements_org_read ON marketplace.advertisements FOR SELECT
  USING (purchaser_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY advertisements_admin ON marketplace.advertisements FOR ALL          -- review/approve/reject (admin)
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY advertisements_org_write ON marketplace.advertisements FOR INSERT
  WITH CHECK (purchaser_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY advertisements_org_modify ON marketplace.advertisements FOR UPDATE
  USING (purchaser_organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (purchaser_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY advertisements_org_delete ON marketplace.advertisements FOR DELETE
  USING (purchaser_organization_id = current_setting('app.active_org', true)::uuid);

-- ===== showcase_projects: public(parent public) | org write | admin — pattern identical to profile_sections (Pass-2 §3.x), s/profile_sections/showcase_projects/, public predicate = is_visible AND deleted_at IS NULL AND parent public =====

-- ===== catalog_favorites: tenant-owned (plain organization_id) =====
ALTER TABLE marketplace.catalog_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalog_favorites_tenant ON marketplace.catalog_favorites FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid);
```

---

## §4 — State Machine Realization (Doc-2 §5.3 · §5.8)
| Machine | Table | Realization | Transition owner |
|---|---|---|---|
| **Vendor — claim** (§5.3) | `vendor_profiles.claim_state` | enum (Pass-1 §3.1.1) | `seeded→invited→claimed` service (claim needs controlling org); `claimed→verified` **idempotent consumer** of Trust `VendorVerified` (DD-1) |
| **Vendor — status** (§5.3) | `vendor_profiles.status` | enum (orthogonal) | `active⇄suspended` service; `active→banned→active` **consumer** of Admin ban/lift (DD-3); ownership transfer → Trust Protection Workflow |
| **Advertisement** (§5.8) | `advertisements.status` | enum (§3.5) | `draft→pending_review→scheduled→active`, `⇄paused`, `→completed`, `→rejected`; date edges = System timer (`schedule_*`); audit = `[ESC-MKT-AUDIT]` |
| Simple lifecycles | `products`/`microsites`/`custom_domains`/`profile_sections`/`category_assignments`/`declared_tier` | enum + CHECK + service | no event-driven edges |

**Transition = outbox (Doc-2 §8, R6):** every state-machine transition that Doc-2 §8 lists as an emitter writes the business row **+** a `core.outbox_events` row in **one transaction** (Doc-6B §3.2 / Doc-6A §7.1) — `VendorClaimed`, `VendorProfilePublished`, `AdvertisementActivated`, etc. (event slugs bound to Doc-2 §8 / Doc-4L; **none coined**). **Reflect-never-decide:** the `verified` and `banned` edges are **consumer effects** of M5/M8 events — M2 never decides them (DR-6-STATE).

## §5 — Cross-Module Reads & Firewalls (DD-1…DD-5)
All cross-module references = **bare UUID, no FK, service-validated, orphan-scan-reconciled** (Doc-2 §0.3 / Doc-6A §5.3/§5.5). No cross-schema JOIN/RLS-traversal.

| DD | Boundary | M2 realization |
|---|---|---|
| **DD-1** | Trust **verification** | `vendor_profiles.claim_state→verified` + `vendor_capacity_profiles.verified_fields_jsonb` are **reflected** consumer effects of `VendorVerified`; M2 **never verifies** (Invariant #6) |
| **DD-2** | RFQ **matching** | RFQ reads **only** `vendor_matching_attributes` (derived read-model) **via service** — never an M2 base table; M2 owns no matching logic |
| **DD-3** | Admin **ban** | `vendor_profiles.status→banned` is a **reflected** consumer effect; banned = public banner (readable) + excluded from routing/search (read-model/FTS); M2 **never decides** the ban |
| **DD-4** | Category **governance** | `categories` admin-write only; suggestions live in `admin.category_suggestions` (M8) |
| **DD-5** | Billing **entitlement** | `custom_domains` registration + `advertisements` purchase gated by **M7 entitlement** (app-layer); `platform_invoice_id` bare UUID; no `billing` read |

**Score firewall (Invariant #6, load-bearing):** M2 stores **no** trust/performance score; `vendor_matching_attributes.trust_band/performance_band/probation_flag` are reflected M5 outputs. **`financial_tier_history` exclusive-writer-as-consumer:** M2 writes `declared` directly + `verified` as idempotent consumer of `VendorTierChanged`; **Trust never writes it**. No secondary signal cross-mutates trust (firewall binding).

## §6 — FTS, Indexing & Performance (first real search — MK-CR9)
**FTS (Doc-6A §10.4/R12):** generated `tsvector` columns + GIN indexes (search-follows-ownership; disposable projection; rebuildable). Realized on the owned text the Doc-5D reads search (`search_catalog`, `list_vendor_directory`):

```sql
-- generated tsvector + GIN (representative — vendor_profiles; products + categories follow the same pattern):
ALTER TABLE marketplace.vendor_profiles
  ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(name, ''))) STORED;  -- [§2.5] 'simple' config (no language-stem dependency)
CREATE INDEX vendor_profiles_fts_idx ON marketplace.vendor_profiles USING GIN (search_vector) WHERE deleted_at IS NULL;
-- products: GENERATED tsvector over coalesce(name,'')||' '||coalesce(description,''); categories: over coalesce(name,'').
```
- **Directory ranking** uses `vendor_matching_attributes.trust_band/performance_band` (Pass-1 §3.1.7 band index) — search relevance × governance band, never a recomputed score.
- **Cursor pagination (Band H):** each Doc-5D list has a deterministic composite sort-key index (`(created_at, id)` or the list's declared order) + partial `WHERE deleted_at IS NULL`. **Page size** resolves from `marketplace.list_page_size_max` (Doc-3 v1.2) — **never a literal** (Doc-6A §10.2).
- **Idempotency** windows resolve from `marketplace.idempotency_dedup_window` (Doc-3 v1.2). **FTS now; Meilisearch future** = out-of-DB (Doc-6A §12 boundary), not realized.

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.2 (CLEARED):** the 2 `marketplace.*` keys (`idempotency_dedup_window` 24h, `list_page_size_max` 100) are **registered** and **seeded in `core.system_configuration`** (M0-owned); M2 **reads** them, seeds none of its own, coins none (Doc-6A §9). No `marketplace.*` patch needed.

**Forward-only order (Doc-6A §10/§11; R10):**
1. (assume `core`, `identity` migrated) `CREATE SCHEMA marketplace`.
2. Enums (claim/status/visibility/tier/assignment/tier-change/claim-source/product/spec-doc/microsite/layout/publish/domain/ad/favorite).
3. `categories` (self-FK) → `vendor_profiles` → §3.1 children → `products`/`spec_library_entries`/`spec_documents`/`product_spec_links` → presentation → `advertisements`/`showcase_projects`/`catalog_favorites`.
4. Deferred intra-schema FKs (`category_assignments_category_fk` — Pass-1 DDL-1).
5. Immutability triggers — each **attaches `core.raise_immutable_violation` directly** (protected columns as `TG_ARGV`; no M2-local function): `financial_tier_history`, `vendor_ownership_history`, `spec_documents` (column-scoped — closable/active-flag columns omitted).
6. FTS generated columns + GIN; cursor/partial/band indexes.
7. RLS enable + policies (all tables).
8. Seeds: **none owned by M2** (POLICY seeded by M0; categories seed = admin-runtime import unless Doc-4D/an admin migration declares a pointer — none coined).

All migrations **forward-only, idempotent**; no destructive change to a frozen object.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to a Doc-2 §10.3 pointer or a §2.5 attribution. Carried register: **`[ESC-6-DD7]`** (claim-records tenancy — additive Doc-2 §6/§3.3, human-approved) · **`[ESC-MKT-AUDIT]`** (ad/product audit — bind nearest Doc-2 §9 by pointer) · **`[ESC-6-SCHEMA-SHOWCASE]`** (showcase columns — bind via Doc-4D/Doc-5D DTO or additive Doc-2) · **`'VENDOR'` `human_ref` prefix** (§2.5 — confirm) · **ADV-PURCH** (structure annotated `purchaser_organization_id` as M4; organizations are M1 — annotation erratum, surfaced for additive structure fix; **no schema impact**, bare UUID). `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.2).

## Appendix A — Doc-6D Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | CHK-6-001 | PASS | every table `id uuid` PK (UUIDv7, M0) |
| | CHK-6-002 | PASS | `human_ref` **only** on `vendor_profiles` (MK-CR11) via `core.allocate_human_ref('VENDOR',…)`; prefix §2.5-carried |
| | CHK-6-003 | PASS | `created_at`/`updated_at` on all; append-only history omit `updated_at` by design; actor stamps present |
| | CHK-6-004 | PASS | soft-delete tuple on every SD table; **no `is_deleted`**; history/links/derived correctly **no SD** |
| | CHK-6-005 | PASS | partial-unique-live on slug/controlling_org/domain/(vendor,category)/(org,target) (`WHERE deleted_at IS NULL`) |
| **B** | CHK-6-010 | PASS | physical `marketplace` namespace; one Prisma `@@schema("marketplace")` (R3b) |
| | CHK-6-011 | PASS | **no cross-schema FK** — `controlling_/purchaser_/owner_/claimed_by_organization_id`, `platform_invoice_id`, target_id all bare UUID |
| | CHK-6-012 | PASS | cross-module refs entity-named, service-validated, orphan-scan (§5) |
| | CHK-6-013 | PASS | no cross-schema JOIN/RLS-traversal; child RLS = **intra-schema** EXISTS only |
| **C** | CHK-6-020 | PASS | RLS on every table; tenant anchors on server-set `app.active_org` (never client); public/admin GUCs fail-closed |
| | CHK-6-021 | PASS | cross-party access = explicit columns (`controlling_/purchaser_organization_id`); no array traversal |
| | CHK-6-022 | **N/A-by-ownership** | non-disclosure (blacklist) is **M4's**; M2 owns no buyer_vendor_status — nothing to byte-equalize here |
| | CHK-6-023 | PASS | authz app-layer (Doc-4D); RLS = coarse backstop, no business logic |
| **D** | CHK-6-030 | PASS | no hard-DELETE on SD/authoritative tables; SD propagation intra-schema (service) |
| | CHK-6-031 | PASS | `spec_documents` versioned-immutable (column-scoped trigger; new row per revision) |
| | CHK-6-032 | PASS | `financial_tier_history`/`vendor_ownership_history` INSERT-only (immutability trigger); tier writes M2-exclusive |
| | CHK-6-033 | **N/A** | no `ai.*` cache here; `vendor_matching_attributes` rebuild = derived-projection refresh (UPSERT), not the enumerated TTL hard-delete |
| **E** | CHK-6-040 | PASS | state transitions emit `core.outbox_events` in one txn (§4) |
| | CHK-6-041 | PASS | **no event coined**; bound to Doc-2 §8/Doc-4L; consumer effects in M2's own schema |
| | CHK-6-042 | PASS | audit via `core.audit_records` (M0); append-only, immutable (by pointer) |
| | CHK-6-043 | **PASS-with-carry** | audited-action coverage per Doc-2 §9; ad/product moderation gap = **`[ESC-MKT-AUDIT]`** (no action coined) |
| **F** | CHK-6-050 | PASS | `max_project_value` = NUMERIC + adjacent `char(3)` currency (BDT default); no bare-amount money column; ad money is M7's |
| **G** | CHK-6-060 | PASS | reads `core.system_configuration`; the 2 `marketplace.*` keys seeded (Doc-3 v1.2); **no key/default coined** |
| | CHK-6-061 | PASS | page-size/idempotency resolve from POLICY keys, never literals (§6) |
| | CHK-6-062 | **N/A** | no role/permission seed in M2 (that is M1 §7) |
| **H** | CHK-6-070 | PASS | Doc-5D reads/lists persistable (directory/search/catalog/microsite) |
| | CHK-6-071 | PASS | each list has a deterministic composite sort-key index (§6) |
| | CHK-6-072 | PASS | idempotency-dedup persisted where Doc-5D declares (consumer windows) |
| | CHK-6-073 | PASS | no non-persistable Doc-5D surface → no `[ESC-6-API]` raised |
| **I** | CHK-6-080 | PASS | **nothing coined** — every table/column/state/enum traces to Doc-2 §10.3/§5.3/§5.8; `categories`/`showcase` status **not** invented |
| | CHK-6-081 | PASS | every physical specific (GUC names, index/trigger/function names, `schedule_*`, `content_jsonb`, FTS config, path-as-text) §2.5-attributed |
| | CHK-6-082 | PASS | `[ESC-6-*]` raised via named channels (DD7/MKT-AUDIT/SCHEMA-SHOWCASE); none resolved locally |
| | CHK-6-083 | PASS | no Doc-2 decision re-opened; DD-7 carried, not resolved |
| **J** | CHK-6-090 | PASS | every model extends the B.1 base + B.2 type catalog; no parallel base/type convention |
| | CHK-6-091 | PASS | **coins no shared enum**; reuses B.3 (`actor_type`/`currency`/outbox `status`) by pointer; M2 enums kept module-owned |
| | CHK-6-092 | PASS | B.4 naming registry followed (`<table>_<cols>_<kind>` indexes; `*_fk`/`*_uq`/`*_chk`) |
| | CHK-6-093 | PASS | B.5 conventions (multi-schema ownership, cross-module-by-UUID, forward-only migration) realized as written |

**37/37 — 0 FAIL.** N/A: CHK-6-022 (non-disclosure = M4), CHK-6-033 (no ai cache), CHK-6-062 (no role seed) — each justified by ownership/shape. PASS-with-carry: CHK-6-043 (`[ESC-MKT-AUDIT]`).

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: the 3-table set + columns (Doc-2 §10.3), `advertisements.status` = §5.8 verbatim, polymorphic no-FK `catalog_favorites`, billing-by-reference (platform never handles buyer↔vendor money), the §4 outbox-in-txn rule, the §5 firewalls, the FTS realization, the 37/37 Appendix A, coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **SHOW-COIN** `showcase_projects` typed columns (title/value/completed_at/status) would be invented — Doc-2 gives only "portfolio entries" | BLOCKER (anti-coining) | **FIXED** — realized base + `content_jsonb` only; typed columns **deferred** via **`[ESC-6-SCHEMA-SHOWCASE]`** (bind from Doc-4D/Doc-5D DTO or additive Doc-2); **no status enum**. Surfaced, not guessed. |
| **ADV-PURCH** structure annotates `purchaser_organization_id` as M4; organizations are M1-owned (Doc-2 §10.2) | MAJOR | **RESOLVED (annotate M1) + surfaced** — bare UUID → M1 `identity.organizations`; the "(M4)" is a structure annotation erratum (no schema impact — no FK either way); flagged for an **additive structure erratum**, **not** reopened locally. |
| **ADV-AUDIT** ad review/approve/reject has no Doc-2 §9 audit action | MAJOR | **CONFIRMED carried** — `[ESC-MKT-AUDIT]`: bind nearest §9 action by pointer at audit time; CHK-6-043 = PASS-with-carry; **none invented**. |
| **AD-SCHED** Doc-2 says `schedule` (one column); realized as `schedule_start`/`schedule_end` | MINOR | **CONFIRMED §2.5** — §5.8 references "start date" + "end date"; two columns realize the window; attributed, not a Doc-2-implied fact. |
| **FAV-FK** polymorphic `target_id` left without integrity enforcement | MINOR | **CONFIRMED binding** — Doc-2 §10.3 mandates **no FK** (polymorphic); existence is service-validated; the FK-free design **is** the realization, not an omission. |
| **FTS-CFG** `to_tsvector` regconfig unpinned risks language-dependency | NIT | **FIXED** — `'simple'` config (no stemmer/language dependency; deterministic), §2.5. |

**Net:** 1 BLOCKER (showcase anti-coining) fixed; 1 MAJOR resolved-and-surfaced (purchaser M1), 1 MAJOR confirmed-carried (ad audit); 2 MINOR confirmed-binding/§2.5; 1 NIT applied. DDL valid + executable; §5.8 ad machine realized; firewalls + billing-by-reference intact; FTS deterministic; 37/37 Appendix A. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6D Content Pass-3 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `marketplace` realization: Advertisement (§5.8 machine, billing-by-reference), Showcase (interim content_jsonb — `[ESC-6-SCHEMA-SHOWCASE]` carried), Catalog Favorite (polymorphic, no FK, tenant-owned); the §4 state consolidation (outbox-in-txn; reflect-never-decide), the §5 cross-module firewalls (score firewall, exclusive-writer, DD-1…5), the §6 first-real-FTS (deterministic 'simple' tsvector+GIN), the §7 forward-only migration, and §8 + Appendix A (37/37, 0 FAIL). Coins nothing; carried `[ESC-6-DD7]` · `[ESC-MKT-AUDIT]` · `[ESC-6-SCHEMA-SHOWCASE]` · `'VENDOR'` prefix · ADV-PURCH erratum — all via named channels. Next: Content Hard Review (cross-pass, full §0–§8 + Appendix A) → Content Freeze Audit → `Doc-6D_SERIES_FROZEN`.*
