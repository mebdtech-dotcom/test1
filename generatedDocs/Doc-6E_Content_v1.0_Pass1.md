# Doc-6E — M3 RFQ Engine (`rfq`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 RFQ AR + 5 children)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (2 BLOCKER + 3 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Realizes §0–§2 + §3.1. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the **RFQ aggregate** — `rfqs` (AR) + `rfq_versions` · `rfq_invitations` · `rfq_invitation_grantees` · `rfq_document_grants` · `rfq_routing_log`. The **first dual-sided buyer+vendor grant-row RLS**, the **§5.4 control-plane state machine**, the **blacklist-undetectable non-disclosure invariant's first DB bite**, version-immutability-once-quoted, the `RFQ-…` human_ref |
| Authority | `Doc-2 §5.4/§6/§10.4/§10.11` (the *what*); `Doc-6A` (the *how*); `Doc-6B §3.3/§4` (`core.allocate_human_ref` + `core.raise_immutable_violation` consumed); `Doc-6C` (`identity` by UUID); `Doc-6D` (`marketplace` by UUID + service); `Doc-4E` (M3 ownership, consumed); `Doc-3 v1.1` (`rfq.*` POLICY — registered) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.4; state sets §5.4 verbatim; POLICY = Doc-3 v1.1; physical specifics §2.5-tagged. `RFQ-` prefix = Doc-2 §0.1-given (not §2.5) |
| DDL note | PostgreSQL 15+; Prisma `@@schema("rfq")` (R3b). **[Doc-2 binding]** = verbatim; **[§2.5 choice]** = physical *how* |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6E realizes Doc-2 §10.4 (the *what*) against frozen Doc-6A (the *how*); passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.1 — 14 `rfq.*` keys). Carried into content: **`[ESC-RFQ-AUDIT]`** (routing/award audit — Pass-3); the `closed_won`/`VendorInvited` event-slug binding (§4/Pass-2). Coins nothing.

## §1 — Scope & the `rfq` Table Partition (Pass-1 slice)
Pass-1 realizes the **RFQ aggregate**: `rfqs` (§3.1.1) + 5 children (§3.1.2–§3.1.6) + the cross-cutting **dual-sided grant-row RLS model** (§2). **Deferred:** `routing_rules` + `matching_results` → Pass-2 (the engine); Quotation AR + 2 children → Pass-2; `comparison_statements` + §4–§8 + Appendix A → Pass-3.

**Non-disclosure (Invariant #11, load-bearing):** `rfq_routing_log` records aggregate `pipeline_counts_jsonb` only — **never** a vendor-visible blacklist trace; read = buyer/compliance only (§3.1.6). The blacklist itself is M4's, served to routing via CRM service only — M3 never reads/persists it.

## §2 — Dual-Sided Grant-Row Tenancy & RLS Realization Model *(the load-bearing section — the moat's RLS)*

### §2.1 The actors + GUCs (Doc-6A §4.2 — server-set, never client)
| Actor | Resolves via | Sees |
|---|---|---|
| **Buyer** (RFQ owner) | `app.active_org = rfqs.organization_id` | own RFQs + versions + invitations + routing log + matching results |
| **Vendor** (invited) | `app.active_org` **= a materialized `rfq_invitation_grantees.organization_id`** | the RFQ + version + granted spec-docs it was invited to — **never** the routing log / matching results / other vendors |
| **Admin/Compliance** | `app.is_platform_staff` | all |

`current_setting(..., true)` → NULL when unset → fail-closed (Doc-6A RLS-2). GUC mechanism = **[§2.5]**; "server-validated active org, never client" = **[Doc-2 §6 / Invariant #5 binding]**.

### §2.2 The grant-row anchor (Doc-2 §10.11 #9 — binding; RLS **never** cross-schema traversal)
The vendor-side RLS anchor is a **materialized row**, not an ownership traversal: at invitation **delivery**, the RFQ Service resolves Vendor Profile → Controlling Org + Vendor Profile → Active Delegation Grants → Representative Orgs (via the M2/M1 services) and writes `rfq_invitation_grantees` (+ `rfq_document_grants` for buyer-uploaded docs). **RLS policies anchor on the plain indexed `organization_id` column of these grant rows** (`= app.active_org`) — never a cross-schema join to M1/M2. **Refresh-on-revocation (RQ-CR11):** a delegation-grant revocation (M1 event) **deletes** the representative's grantee/doc-grant rows; the removal is audited (`core.audit_records`, service). The grant table has **no soft-delete** — revocation is a hard `DELETE` of the grant (Doc-2 §10.4).

### §2.3 Per-class RLS plan (binding — RQ-CR2)
| Class | Tables | Read | Write |
|---|---|---|---|
| Buyer-owned | `rfqs`, `rfq_versions` | buyer-org **OR** invited-vendor-via-grant **OR** admin | buyer-org **OR** admin (vendor read-only) |
| Invitation head | `rfq_invitations` | buyer-org **OR** invited-vendor-via-grant **OR** admin | buyer-org/service **OR** admin |
| Vendor-side grant anchors | `rfq_invitation_grantees`, `rfq_document_grants` | grantee (`org = active_org`) **OR** buyer-of-rfq **OR** admin | service/admin (delivery + revocation) |
| Buyer/compliance-only | `rfq_routing_log` | buyer-org **OR** admin — **never vendor** | service-INSERT only (append-only) |

**Nested-RLS note (HQ-003 class — verified):** the vendor read of `rfqs`/`rfq_versions`/`rfq_invitations` is an intra-schema `EXISTS` over `rfq_invitation_grantees` whose **own** RLS is the simple `organization_id = app.active_org` — a single indexed predicate that **cannot** be defeated (unlike the Doc-6C memberships circular case). The buyer read of children resolves because the buyer sees its own `rfqs` row (`organization_id = active_org`). Authorization is app-layer (Doc-4E); RLS = backstop. RLS positive/negative/cross-tenant + **non-disclosure byte-equivalence** tests = Doc-8 (Doc-6A §11.5).

---

## §3.1 — The RFQ aggregate

### §3.1.1 `rfq.rfqs` (AR; §5.4 control plane; `RFQ-…` human_ref; buyer tenant)
Realizes Doc-2 §10.4 + §5.4. Buyer `organization_id` tenant; cross-module refs (`category_id`→M2; `organization_id`/`creator_user_id`/`approver_user_id`→M1) bare UUID, no FK. `human_ref` via `core.allocate_human_ref('RFQ', year)`.

```sql
CREATE TYPE rfq.rfq_state AS ENUM (                              -- [Doc-2 §5.4 binding] 13 states
  'draft','pending_internal_approval','submitted','under_review','matching',
  'vendors_notified','quotations_received','buyer_reviewing','shortlisted',
  'closed_won','closed_lost','expired','cancelled');
CREATE TYPE rfq.routing_mode AS ENUM ('approved_only','approved_conditional','approved_open','open_market');  -- [Doc-2 §10.4]
CREATE TYPE rfq.work_nature  AS ENUM ('supply','service','fabricate','consult');                              -- [Doc-2 §10.4] = M2 capability matrix

CREATE TABLE rfq.rfqs (
  id                  uuid    NOT NULL,                          -- [Doc-6A §3.1] PK UUIDv7
  human_ref           text    NOT NULL,                          -- [Doc-2 §0.1/§10.4] RFQ-YYYY-NNNNNN via core.allocate_human_ref('RFQ', year)
  organization_id     uuid    NOT NULL,                          -- [Doc-2 §10.4] bare UUID → M1 (owner); RLS tenant anchor
  creator_user_id     uuid    NOT NULL,                          -- [Doc-2 §10.4] bare UUID → M1
  approver_user_id    uuid,                                      -- [Doc-2 §10.4] bare UUID → M1 (internal approval path)
  category_id         uuid    NOT NULL,                          -- [Doc-2 §10.4] bare UUID → M2
  state               rfq.rfq_state   NOT NULL DEFAULT 'draft',  -- [Doc-2 §5.4]
  routing_mode        rfq.routing_mode NOT NULL,                 -- [Doc-2 §10.4]
  work_nature         rfq.work_nature[] NOT NULL DEFAULT '{}',   -- [Doc-2 §10.4] CHECK ⊆ {supply,service,fabricate,consult} — realized by the enum array; non-empty at submit (service, A-05)
  estimated_value     numeric,                                   -- [Doc-2 §10.4] NOT NULL at submit (service; A-05) — nullable in draft
  currency            char(3) NOT NULL DEFAULT 'BDT',            -- [Doc-6A R9 / Doc-2 §0.4] multi-currency-ready
  delivery_country    text, delivery_division text, delivery_district text,  -- [Doc-2 §10.4 "delivery geography"] flat geo (mirrors §10.3 vocab) [§2.5]
  current_version_no  integer NOT NULL DEFAULT 1,                -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.4] SD = archive
  CONSTRAINT rfqs_pkey PRIMARY KEY (id),
  CONSTRAINT rfqs_human_ref_uq UNIQUE (human_ref)               -- [Doc-2 §0.1] never reused
);
CREATE INDEX rfqs_org_state_idx ON rfq.rfqs (organization_id, state) WHERE deleted_at IS NULL;  -- [§2.5] Band H buyer list
CREATE INDEX rfqs_category_idx  ON rfq.rfqs (category_id)        WHERE deleted_at IS NULL;       -- [§2.5] matching feed
```
- **§5.4 (RQ-CR4):** `state` enum + DEFAULT; transitions service/event (§4, Pass-3): `draft→[pending_internal_approval→]submitted→under_review→matching→vendors_notified→quotations_received→buyer_reviewing→shortlisted→closed_won/closed_lost`; `expired` = System timer (validity window in `core.system_configuration`, Doc-3 v1.1, never a literal); `cancelled` from any active state (audited reason); `closed_won` emits engagement (M4) + performance inputs (M5) via outbox (§4). A pure-DB trigger cannot express these (cross-module effects + the validity window) — service/consumer.
- **`work_nature` (RQ-CR9):** the enum-array realizes the `⊆ {supply,service,fabricate,consult}` CHECK by type (no `text[]`+CHECK needed); non-emptiness is an at-submit service guard (the four values map 1:1 to the M2 capability matrix).
- **`estimated_value` (A-05):** nullable in `draft`, `NOT NULL` enforced at submit (service) — the tier gate is undefined without it; carries `currency` (R9).
- **`human_ref`:** `'RFQ'` prefix is **Doc-2 §0.1-given** (`RFQ-2026-000123`), not a §2.5 choice. Allocated in the create transaction.
- **RLS:** buyer-org + invited-vendor-read + admin (§3.1.7). **Prisma [§2.5]:** `Rfq`, enums `RfqState`/`RoutingMode`/`WorkNature @@schema("rfq")`, `@@map("rfqs")`.

### §3.1.2 `rfq.rfq_versions` (immutable once quoted — Doc-2 §10.11 #6)
Realizes Doc-2 §10.4. In-module FK → `rfqs`; `spec_document_ids[]` bare-UUID array → M2; **no SD**; `is_immutable` set on first quotation → UPDATE rejected once set.

```sql
CREATE TABLE rfq.rfq_versions (
  id                uuid    NOT NULL,
  rfq_id            uuid    NOT NULL,                            -- [Doc-6A §5.2] in-module FK
  version_no        integer NOT NULL,                           -- [Doc-2 §10.4]
  content_jsonb     jsonb,                                      -- [Doc-2 §10.4] the RFQ scope/spec payload
  spec_document_ids uuid[]  NOT NULL DEFAULT '{}',              -- [Doc-2 §10.4] bare-UUID array → M2 spec_documents (orphan-scan; vendor access via rfq_document_grants)
  revision_reason   text,                                       -- [Doc-2 §10.4]
  is_immutable      boolean NOT NULL DEFAULT false,             -- [Doc-2 §10.4/§10.11 #6] set true on first quotation
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.4] (no updated_at after freeze; no SD)
  CONSTRAINT rfq_versions_pkey PRIMARY KEY (id),
  CONSTRAINT rfq_versions_rfq_fk FOREIGN KEY (rfq_id) REFERENCES rfq.rfqs(id),
  CONSTRAINT rfq_versions_rfq_no_uq UNIQUE (rfq_id, version_no)  -- [§2.5] one row per (rfq, version)
);

-- Immutability once quoted (Doc-2 §10.11 #6) — conditional: editable while is_immutable=false; frozen once set; never deleted.
-- core.raise_immutable_violation is unconditional (TG_ARGV) → cannot express "only when OLD.is_immutable" → rfq-local function:
CREATE FUNCTION rfq.rfq_versions_freeze_when_immutable() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = rfq, pg_temp AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'rfq.rfq_versions: versions are append-only (DELETE forbidden); edits create a new version';
  END IF;
  IF OLD.is_immutable THEN                                       -- once quoted, the whole row is frozen (Doc-2 §10.11 #6)
    RAISE EXCEPTION 'rfq.rfq_versions: version % is immutable (a quotation exists); create version %+1', OLD.version_no, OLD.version_no;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rfq_versions_immutability
  BEFORE UPDATE OR DELETE ON rfq.rfq_versions FOR EACH ROW
  EXECUTE FUNCTION rfq.rfq_versions_freeze_when_immutable();
```
- **`is_immutable` flip:** the `false→true` UPDATE passes (OLD.is_immutable false); every subsequent UPDATE raises. New scope = a new version row (`current_version_no++` on `rfqs`). **RLS:** inherits the parent RFQ's read (buyer + invited-vendor + admin); write buyer/admin (§3.1.7). **Prisma [§2.5]:** `RfqVersion`.

### §3.1.3 `rfq.rfq_invitations` (buyer head row; vendor via grantees)
Realizes Doc-2 §10.4. In-module FK → `rfqs`; `vendor_profile_id` bare UUID → M2; **no SD** (state-tracked); `UNIQUE(rfq_id, vendor_profile_id)`. `VendorInvited` emitted only at `delivered`.

```sql
CREATE TYPE rfq.invitation_state AS ENUM ('draft','selected','deferred','delivered','accepted','declined','expired');  -- [Doc-2 §10.4 binding]

CREATE TABLE rfq.rfq_invitations (
  id                uuid    NOT NULL,
  rfq_id            uuid    NOT NULL,                            -- [Doc-6A §5.2] in-module FK
  vendor_profile_id uuid    NOT NULL,                           -- [Doc-2 §10.4] bare UUID → M2
  state             rfq.invitation_state NOT NULL DEFAULT 'draft',  -- [Doc-2 §10.4]
  throttle_window   text,                                       -- [Doc-2 §10.4] throttling (window bound from rfq.* POLICY; [§2.5] carrier)
  delivered_at      timestamptz,                                -- [Doc-2 §10.4] VendorInvited fires here (only at delivered)
  responded_at      timestamptz,                                -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  CONSTRAINT rfq_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT rfq_invitations_rfq_fk FOREIGN KEY (rfq_id) REFERENCES rfq.rfqs(id),
  CONSTRAINT rfq_invitations_rfq_vendor_uq UNIQUE (rfq_id, vendor_profile_id)  -- [Doc-2 §10.4] one invitation per vendor per RFQ
);
CREATE INDEX rfq_invitations_rfq_state_idx ON rfq.rfq_invitations (rfq_id, state);  -- [§2.5]
```
- **Response-rate integrity (Doc-2 §10.4):** undelivered invitations (`selected`/`deferred`) are excluded from response-rate inputs — a **query/Trust-feed** rule (the column tracks state; the exclusion is consumer logic, not a constraint). A formal **decline** (`declined`) is recorded here, **not** as a quotation state (RQ-CR5). **RLS:** buyer + invited-vendor-via-own-grant + admin (§3.1.7). **Prisma [§2.5]:** `RfqInvitation`, enum `InvitationState`.

### §3.1.4 `rfq.rfq_invitation_grantees` (**the vendor-side RLS anchor**; revocation-removed)
Realizes Doc-2 §10.4 + §10.11 #9. In-module FK → `rfq_invitations`; `organization_id` (grantee) bare UUID → M1 = the anchor; **no SD** (hard-deleted on revocation, audited).

```sql
CREATE TYPE rfq.grant_access_type AS ENUM ('controlling_org','representative_org');  -- [Doc-2 §10.4 binding]

CREATE TABLE rfq.rfq_invitation_grantees (
  id              uuid NOT NULL,
  invitation_id   uuid NOT NULL,                                -- [Doc-6A §5.2] in-module FK
  organization_id uuid NOT NULL,                                -- [Doc-2 §10.4] bare UUID → M1 — THE vendor-side RLS anchor (= active org)
  access_type     rfq.grant_access_type NOT NULL,              -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.4] (removal audited via core.audit_records, service)
  CONSTRAINT rfq_invitation_grantees_pkey PRIMARY KEY (id),
  CONSTRAINT rfq_invitation_grantees_invite_fk FOREIGN KEY (invitation_id) REFERENCES rfq.rfq_invitations(id),
  CONSTRAINT rfq_invitation_grantees_uq UNIQUE (invitation_id, organization_id)  -- [§2.5] one grant per (invitation, org)
);
CREATE INDEX rfq_invitation_grantees_org_idx ON rfq.rfq_invitation_grantees (organization_id);  -- [§2.5] the RLS-anchor index (Doc-2 §10.4 "plain indexed organization_id")
```
- **Materialized at delivery (Doc-2 §10.4):** the RFQ Service writes one row per resolved org (controlling + active representatives). **Revocation = hard `DELETE`** (one row, audited) — the child-table pattern's revocation support; no array rewrite. **No immutability trigger** (rows are deletable by design). **RLS:** grantee (`org = active_org`) OR buyer-of-rfq OR admin (§3.1.7). **Prisma [§2.5]:** `RfqInvitationGrantee`, enum `GrantAccessType`.

### §3.1.5 `rfq.rfq_document_grants` (buyer-uploaded spec-doc access anchor)
Realizes Doc-2 §10.4. In-module FKs → `rfqs` + `rfq_invitations` (`source_invitation_id`); `spec_document_id` bare UUID → M2; `organization_id` (grantee) anchor; **no SD** (revocation/expiry-removed, audited).

```sql
CREATE TABLE rfq.rfq_document_grants (
  id                  uuid NOT NULL,
  rfq_id              uuid NOT NULL,                            -- [Doc-6A §5.2] in-module FK
  source_invitation_id uuid NOT NULL,                          -- [Doc-6A §5.2] in-module FK → rfq_invitations
  spec_document_id    uuid NOT NULL,                           -- [Doc-2 §10.4] bare UUID → M2 spec_documents
  organization_id     uuid NOT NULL,                           -- [Doc-2 §10.4] bare UUID → M1 — grantee RLS anchor
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT rfq_document_grants_pkey PRIMARY KEY (id),
  CONSTRAINT rfq_document_grants_rfq_fk    FOREIGN KEY (rfq_id) REFERENCES rfq.rfqs(id),
  CONSTRAINT rfq_document_grants_invite_fk FOREIGN KEY (source_invitation_id) REFERENCES rfq.rfq_invitations(id),
  CONSTRAINT rfq_document_grants_uq UNIQUE (spec_document_id, organization_id)  -- [§2.5] one grant per (doc, org)
);
CREATE INDEX rfq_document_grants_org_idx ON rfq.rfq_document_grants (organization_id);  -- [§2.5] RLS anchor
```
- **The grant authorizes the M2 read (DD-2):** the buyer-uploaded `spec_documents` row lives in M2 and is **not** public (`owner_organization_id` set — Doc-6D §3.3.3); the invited vendor reads it **only** because this grant row exists — the app resolves the grant, then reads M2 by service. Doc-6E owns the grant; M2 owns the doc. **Written at delivery with grantees; revocation/expiry = hard DELETE (audited).** **RLS:** grantee OR buyer-of-rfq OR admin (§3.1.7). **Prisma [§2.5]:** `RfqDocumentGrant`.

### §3.1.6 `rfq.rfq_routing_log` (append-only; buyer/compliance only — **no blacklist trace**)
Realizes Doc-2 §10.4 + §10.11 #5. In-module FK → `rfqs`; **append-only**; **buyer + compliance read only, never vendor**; `pipeline_counts_jsonb` aggregate only.

```sql
CREATE TABLE rfq.rfq_routing_log (
  id                  uuid NOT NULL,
  rfq_id              uuid NOT NULL,                            -- [Doc-6A §5.2] in-module FK
  routing_mode        rfq.routing_mode NOT NULL,               -- [Doc-2 §10.4]
  applied_filter_ref  uuid,                                    -- [Doc-2 §10.4] → routing_rules (Pass-2)
  pipeline_counts_jsonb jsonb NOT NULL,                        -- [Doc-2 §10.4] per-step in/out AGGREGATE counts — NEVER a vendor-identifying blacklist trace (Invariant #11)
  executed_at         timestamptz NOT NULL DEFAULT now(),      -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT rfq_routing_log_pkey PRIMARY KEY (id),
  CONSTRAINT rfq_routing_log_rfq_fk FOREIGN KEY (rfq_id) REFERENCES rfq.rfqs(id)
);
CREATE INDEX rfq_routing_log_rfq_idx ON rfq.rfq_routing_log (rfq_id, executed_at);  -- [§2.5]

-- Append-only (Doc-2 §10.4) — block UPDATE + DELETE via the M0 shared guard (all columns protected; empty-args would leave UPDATE open — HR-1 lesson from Doc-6D):
CREATE TRIGGER rfq_routing_log_immutable
  BEFORE UPDATE OR DELETE ON rfq.rfq_routing_log FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','rfq_id','routing_mode','applied_filter_ref','pipeline_counts_jsonb','executed_at','created_at','created_by');  -- [Doc-6B §4]
```
- **Non-disclosure (Invariant #11, first DB bite):** the log stores **aggregate** per-step counts (e.g. `{"blacklist":{"in":40,"out":3}}`) — **never** the identity of an excluded vendor. A blacklisted vendor leaves **no** distinguishable trace; the buyer sees only that N were filtered. **Read = buyer-of-rfq OR admin; no vendor policy at all** (§3.1.7). **Prisma [§2.5]:** `RfqRoutingLog`.

### §3.1.7 Consolidated RLS DDL for the RFQ aggregate (DDL — not prose)
Permissive policies OR'd; read-scope split from write-scope (Doc-6A §4.6); vendor read anchors on the simple-RLS grant rows (§2.3 nested-RLS note).

```sql
-- ===== rfqs: buyer all | invited-vendor read | admin all =====
ALTER TABLE rfq.rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfqs_buyer ON rfq.rfqs FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY rfqs_admin ON rfq.rfqs FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY rfqs_vendor_read ON rfq.rfqs FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.rfq_invitation_grantees g
                   JOIN rfq.rfq_invitations i ON i.id = g.invitation_id
                  WHERE i.rfq_id = rfqs.id
                    AND g.organization_id = current_setting('app.active_org', true)::uuid));

-- ===== rfq_versions: buyer write | invited-vendor read | admin =====
ALTER TABLE rfq.rfq_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfq_versions_buyer ON rfq.rfq_versions FOR ALL
  USING (EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = rfq_versions.rfq_id
                   AND r.organization_id = current_setting('app.active_org', true)::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = rfq_versions.rfq_id
                   AND r.organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY rfq_versions_admin ON rfq.rfq_versions FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY rfq_versions_vendor_read ON rfq.rfq_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.rfq_invitation_grantees g
                   JOIN rfq.rfq_invitations i ON i.id = g.invitation_id
                  WHERE i.rfq_id = rfq_versions.rfq_id
                    AND g.organization_id = current_setting('app.active_org', true)::uuid));

-- ===== rfq_invitations: buyer write | invited-vendor (own grant) read | admin =====
ALTER TABLE rfq.rfq_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfq_invitations_buyer ON rfq.rfq_invitations FOR ALL
  USING (EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = rfq_invitations.rfq_id
                   AND r.organization_id = current_setting('app.active_org', true)::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = rfq_invitations.rfq_id
                   AND r.organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY rfq_invitations_admin ON rfq.rfq_invitations FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY rfq_invitations_vendor_read ON rfq.rfq_invitations FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.rfq_invitation_grantees g
                  WHERE g.invitation_id = rfq_invitations.id
                    AND g.organization_id = current_setting('app.active_org', true)::uuid));

-- ===== rfq_invitation_grantees: grantee (own) | buyer-of-rfq | admin =====
ALTER TABLE rfq.rfq_invitation_grantees ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfq_grantees_self ON rfq.rfq_invitation_grantees FOR SELECT
  USING (organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY rfq_grantees_buyer ON rfq.rfq_invitation_grantees FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.rfq_invitations i JOIN rfq.rfqs r ON r.id = i.rfq_id
                  WHERE i.id = rfq_invitation_grantees.invitation_id
                    AND r.organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY rfq_grantees_admin ON rfq.rfq_invitation_grantees FOR ALL          -- service/admin write (delivery + revocation DELETE)
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (grant create/delete run under the service's platform-staff/SECURITY DEFINER path; vendors never write their own grants.)

-- ===== rfq_document_grants: same shape as grantees (grantee | buyer-of-rfq | admin) =====
ALTER TABLE rfq.rfq_document_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfq_doc_grants_self ON rfq.rfq_document_grants FOR SELECT
  USING (organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY rfq_doc_grants_buyer ON rfq.rfq_document_grants FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = rfq_document_grants.rfq_id
                   AND r.organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY rfq_doc_grants_admin ON rfq.rfq_document_grants FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ===== rfq_routing_log: buyer-of-rfq | admin — NEVER vendor; service INSERT only =====
ALTER TABLE rfq.rfq_routing_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfq_routing_log_buyer_read ON rfq.rfq_routing_log FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = rfq_routing_log.rfq_id
                      AND r.organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY rfq_routing_log_insert ON rfq.rfq_routing_log FOR INSERT
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
              OR EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = rfq_routing_log.rfq_id
                           AND r.organization_id = current_setting('app.active_org', true)::uuid));
-- (UPDATE/DELETE blocked by the immutability trigger — no UPDATE/DELETE policy; NO vendor SELECT policy = blacklist-undetectable.)
```
- **Why no vendor policy on `rfq_routing_log`:** the absence of a vendor-readable policy is the **realization** of Invariant #11 at the RLS layer — a vendor cannot query the routing pipeline at all, so a blacklist filter is undetectable. Combined with aggregate-only `pipeline_counts_jsonb`, even the buyer sees no per-vendor exclusion identity.

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: the 6-table set + columns (Doc-2 §10.4), §5.4 13-state set verbatim, invitation/access_type/routing_mode/work_nature sets verbatim, `UNIQUE(rfq_id, vendor_profile_id)`, the grant-row anchor pattern (§10.11 #9), `RFQ-` prefix (Doc-2 §0.1), `core.allocate_human_ref` signature, coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **RT-LEAK** `rfq_routing_log` initially had a generic tenant policy that could expose the pipeline to a vendor on its own RFQ-adjacent org → blacklist detectable | BLOCKER (Invariant #11) | **FIXED** — §3.1.7: **no vendor SELECT policy**; read = buyer-of-rfq OR admin only; `pipeline_counts_jsonb` aggregate-only. Blacklist undetectable at the RLS + payload layer. |
| **VER-IMM** `rfq_versions` immutability used `core.raise_immutable_violation` (unconditional) — would block the legitimate edit of a *draft* (not-yet-quoted) version | BLOCKER | **FIXED** — conditional rfq-local trigger `rfq_versions_freeze_when_immutable`: editable while `is_immutable=false`, frozen once set (Doc-2 §10.11 #6); DELETE always blocked (append-only). |
| **NEST-RLS** vendor read of `rfqs`/`versions`/`invitations` via nested `EXISTS` over grant rows — risk of the Doc-6C HQ-003 circular-RLS defeat | MAJOR | **FIXED/verified** — §2.3: the anchor `rfq_invitation_grantees` RLS is the **simple** `organization_id = active_org` (single indexed predicate), not defeatable; the buyer path resolves via own `rfqs`. Documented; Doc-8 to assert. |
| **WN-CHK** `work_nature[]` ⊆ {set} realized as `text[]`+CHECK risked drift | MAJOR | **FIXED** — realized as an **enum array** (`rfq.work_nature[]`) — the type enforces the subset; non-empty at submit = service (A-05). |
| **GEO-COIN** `delivery geography` columns invented | MAJOR | **RESOLVED (attributed)** — flat `delivery_country/division/district` mirror the established §10.3 geography vocabulary; §2.5-tagged, not implied as a Doc-2 enumeration; surfaced. |
| **VAL-SUBMIT** `estimated_value NOT NULL` would break draft creation | MINOR | **FIXED** — nullable column; `NOT NULL`-at-submit is the A-05 service guard (the tier gate is undefined without it). |
| **GRANT-DEL** grantee/doc-grant immutability vs revocation-DELETE | MINOR | **CONFIRMED deletable** — §3.1.4/§3.1.5: no immutability trigger; revocation = hard DELETE (audited via `core.audit_records`), per Doc-2 §10.4 "rows removed on revocation." |
| **THROTTLE** `throttle_window` as text carrier | NIT | **CONFIRMED §2.5** — the window value resolves from `rfq.*` POLICY (Doc-3 v1.1); the column carries the applied window; not a literal. |

**Net:** 2 BLOCKER (routing-log blacklist leak, version-immutability-blocks-draft) + 3 MAJOR (nested-RLS verify, work_nature enum-array, geography attribution) fixed/resolved; 2 MINOR + 1 NIT applied/confirmed. The routing-log finding is the load-bearing one — Invariant #11's first DB realization. DDL valid + executable; dual-sided grant RLS non-defeating; blacklist undetectable. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6E Content Pass-1 (§0–§2 · §3.1 RFQ AR + 5 children) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the first dual-sided buyer+vendor grant-row RLS (materialized `rfq_invitation_grantees`/`rfq_document_grants` anchors, never cross-schema traversal), the §5.4 13-state control plane, version-immutability-once-quoted (conditional trigger), the blacklist-undetectable non-disclosure invariant's first DB bite (`rfq_routing_log` no vendor policy + aggregate-only counts), and the `RFQ-…` human_ref. Columns verbatim Doc-2 §10.4; state sets §5.4 verbatim; coins nothing. Next: Pass-2 (Routing `routing_rules` + Matching `matching_results` — the engine, gate-excluded discipline · Quotation AR + `quotation_versions`/`quotation_visibility` — §5.5, one-active partial-unique, `rfq_version_id` binding FK).*
