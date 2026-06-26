# Doc-6E — M3 RFQ Engine (`rfq`) Schema Realization — Content v1.0 **Pass-2** (§3.2 Routing · §3.3 Matching · §3.4 Quotation AR + 2 children)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (1 BLOCKER + 3 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Realizes §3.2 + §3.3 + §3.4. Next: Pass-3 |
| Date | 2026-06-26 |
| Realizes | **Routing** (`routing_rules` — config; params from `core.system_configuration`) · **Matching** (`matching_results` — derived; gate-excluded never written; buyer-side-only) · **Quotation** (`quotations` AR — §5.5, one-active partial-unique, `QTN-…`; `quotation_versions` — immutable, `rfq_version_id` binding FK; `quotation_visibility` — buyer-side read grant) |
| Authority | `Doc-2 §5.5/§10.4/§10.11` (the *what*); `Doc-6A` (the *how*); `Doc-6B §3.3/§4` (consumed); `Doc-6C`/`Doc-6D` (by UUID + service); `Doc-4E` (M3 ownership); `Doc-3 v1.1` (`rfq.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.4; `quotations.state` = §5.5 verbatim; `currency` per value field = R9/§0.4 mandate; physical specifics §2.5-tagged. `QTN-` prefix = Doc-2 §0.1-given |
| DDL note | PostgreSQL 15+; Prisma `@@schema("rfq")`. Closes Pass-1's `rfq_routing_log.applied_filter_ref` → `routing_rules` reference. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.2 — `rfq.routing_rules` (platform config; params from `core.system_configuration`; admin/System only)
Realizes Doc-2 §10.4. Platform-owned rule definitions; **parameters resolve from `core.system_configuration`** (Doc-3 v1.1, never literals). SD (retire). Doc-2 enumerates only "rule definitions."

> **`[ESC-RFQ-SCHEMA-RULES]` — carried (corpus underspecification).** Doc-2 §10.4 gives `routing_rules` as "rule definitions" with **no column list**. Inventing a typed rule schema would **coin**. **Interim:** `name` + `rule_definition_jsonb` (the definition; **parameter values are POLICY-key references**, not literals — Doc-2 binding) + `is_active`. The durable rule schema is bound by **Doc-4E/Doc-5E** or admin-runtime — never invented here.

```sql
CREATE TABLE rfq.routing_rules (
  id                   uuid    NOT NULL,                         -- [Doc-6A §3.1] PK UUIDv7
  name                 text    NOT NULL,                         -- [§2.5] operator label (interim)
  rule_definition_jsonb jsonb  NOT NULL,                         -- [Doc-2 §10.4 "rule definitions" / ESC-RFQ-SCHEMA-RULES] parameters = core.system_configuration key refs, never literals
  is_active            boolean NOT NULL DEFAULT true,            -- [§2.5] enable flag (interim)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.4] SD = retire
  CONSTRAINT routing_rules_pkey PRIMARY KEY (id)
);
```
- **Params from POLICY (Doc-2 §10.4 binding):** a routing rule never embeds a literal threshold; it references an `rfq.*` key (Doc-3 v1.1) read from `core.system_configuration` at evaluation. **RLS:** admin/System only — **never buyer/vendor** (§3.x). **Prisma [§2.5]:** `RoutingRule`.

## §3.3 — `rfq.matching_results` (derived; **gate-excluded never written**; buyer-side-only)
Realizes Doc-2 §10.4 + §10.11 #5. In-module FKs → `rfqs` + `rfq_versions` (per version); `vendor_profile_id` bare UUID → M2; **NO SD** (regenerable); **contains only vendors that passed every gate**.

```sql
CREATE TABLE rfq.matching_results (
  id                uuid    NOT NULL,
  rfq_id            uuid    NOT NULL,                            -- [Doc-6A §5.2] in-module FK
  rfq_version_id    uuid    NOT NULL,                            -- [Doc-6A §5.2] in-module FK (per version)
  vendor_profile_id uuid    NOT NULL,                           -- [Doc-2 §10.4] bare UUID → M2 (passed-gate vendor)
  confidence_score  numeric NOT NULL,                           -- [Doc-2 §10.4] match score
  breakdown_jsonb   jsonb   NOT NULL,                           -- [Doc-2 §10.4] tier/capacity/performance/trust/geography sub-scores
  formula_version   text    NOT NULL,                           -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.4] (NO SD — regenerable)
  CONSTRAINT matching_results_pkey PRIMARY KEY (id),
  CONSTRAINT matching_results_rfq_fk     FOREIGN KEY (rfq_id) REFERENCES rfq.rfqs(id),
  CONSTRAINT matching_results_version_fk FOREIGN KEY (rfq_version_id) REFERENCES rfq.rfq_versions(id),
  CONSTRAINT matching_results_version_vendor_uq UNIQUE (rfq_version_id, vendor_profile_id)  -- [§2.5] one result per (version, vendor)
);
CREATE INDEX matching_results_version_idx ON rfq.matching_results (rfq_version_id, confidence_score DESC);  -- [§2.5] Band H ranked read
```
- **Gate-excluded never written (Invariant #11, RQ-CR3):** the matching service reads `vendor_matching_attributes` (M2, **via service** — DD-2) + the blacklist exclusion (M4 CRM service), runs every gate (blacklist/category/capability/work-nature/verification/tier), and **inserts a row only for a vendor that passed all of them**. A blacklisted/gate-failed vendor is **never** a row here — so the buyer's matching set is byte-identical whether a vendor was blacklisted or simply not a match. M3 **owns** the gate logic; M2/M4 own the inputs.
- **Derived/regenerable (Doc-6A R7):** rebuilt per `rfq_version` (DELETE-by-version + INSERT, or UPSERT) on input-change/re-match; not authoritative; no SD, no immutability trigger.
- **RLS:** read = buyer-of-parent-rfq OR compliance/admin, **NEVER vendor** (RQ-HR-1); write = service/admin only (§3.x). **Prisma [§2.5]:** `MatchingResult`.

## §3.4 — Quotation aggregate

### §3.4.1 `rfq.quotations` (AR; §5.5; one-active partial-unique; `QTN-…`; vendor `controlling_organization_id` anchor)
Realizes Doc-2 §10.4 + §5.5. In-module FK → `rfqs`; `vendor_profile_id`/`submitting_user_id`/`controlling_organization_id` bare UUID → M2/M1; **YES SD** (draft discard).

```sql
CREATE TYPE rfq.quotation_state AS ENUM ('draft','submitted','withdrawn','selected','not_selected','expired');  -- [Doc-2 §5.5 binding]

CREATE TABLE rfq.quotations (
  id                          uuid    NOT NULL,
  human_ref                   text    NOT NULL,                  -- [Doc-2 §0.1/§10.4] QTN-YYYY-NNNNNN via core.allocate_human_ref('QTN', year)
  rfq_id                      uuid    NOT NULL,                  -- [Doc-6A §5.2] in-module FK
  vendor_profile_id           uuid    NOT NULL,                  -- [Doc-2 §10.4] bare UUID → M2
  submitting_user_id          uuid    NOT NULL,                  -- [Doc-2 §10.4] bare UUID → M1
  controlling_organization_id uuid    NOT NULL,                  -- [Doc-2 §10.4] bare UUID → M1 — vendor-side RLS anchor + quota attribution
  state                       rfq.quotation_state NOT NULL DEFAULT 'draft',  -- [Doc-2 §5.5]
  current_version_no          integer NOT NULL DEFAULT 1,        -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.4] SD = draft discard
  CONSTRAINT quotations_pkey PRIMARY KEY (id),
  CONSTRAINT quotations_human_ref_uq UNIQUE (human_ref),
  CONSTRAINT quotations_rfq_fk FOREIGN KEY (rfq_id) REFERENCES rfq.rfqs(id)
);
CREATE UNIQUE INDEX quotations_active_uq ON rfq.quotations (rfq_id, vendor_profile_id)
  WHERE state IN ('draft','submitted') AND deleted_at IS NULL;  -- [Doc-2 §10.11 #7] ONE active quotation per vendor per RFQ
CREATE INDEX quotations_org_idx ON rfq.quotations (controlling_organization_id) WHERE deleted_at IS NULL;  -- [§2.5] vendor list + quota attribution
```
- **§5.5 (RQ-CR5):** `draft→submitted` (active rfq_version; one-active guard); `submitted→submitted` (revise → new `quotation_version`); `submitted→withdrawn/selected/not_selected/expired`; `draft→discard` (soft-delete). Quota consumed from the **Controlling Org** (M7, service) on submit, regardless of acting representative. A **decline** is an `rfq_invitations.state`, not a quotation state (Pass-1).
- **`human_ref`:** `'QTN'` prefix = **Doc-2 §0.1-given**, create-transaction allocation.
- **RLS:** vendor (`controlling_organization_id`) write+read OR buyer-via-`quotation_visibility` read OR representative-via-grantee read OR admin (§3.x). **Prisma [§2.5]:** `Quotation`, enum `QuotationState`.

### §3.4.2 `rfq.quotation_versions` (immutable; `rfq_version_id` binding FK; currency per R9)
Realizes Doc-2 §10.4. In-module FKs → `quotations` + **`rfq_versions` (the binding cross-aggregate FK)**; **NO SD; immutable** (append-only revisions; `supersedes_version_no`).

```sql
CREATE TABLE rfq.quotation_versions (
  id                  uuid    NOT NULL,
  quotation_id        uuid    NOT NULL,                          -- [Doc-6A §5.2] in-module FK
  rfq_version_id      uuid    NOT NULL,                          -- [Doc-2 §10.4 binding] in-module FK → rfq_versions (the quote binds to a specific RFQ version)
  version_no          integer NOT NULL,                          -- [Doc-2 §10.4]
  price_breakdown_jsonb jsonb NOT NULL,                          -- [Doc-2 §10.4] line amounts (denominated in `currency`)
  currency            char(3) NOT NULL DEFAULT 'BDT',            -- [Doc-6A R9 / Doc-2 §0.4] mandated currency per value field (QV-CUR)
  delivery_terms      text,                                      -- [Doc-2 §10.4]
  warranty_terms      text,                                      -- [Doc-2 §10.4]
  attachments_refs    jsonb,                                     -- [Doc-2 §10.4] storage refs ([§2.5] jsonb)
  revision_reason     text,                                      -- [Doc-2 §10.4]
  supersedes_version_no integer,                                 -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT quotation_versions_pkey PRIMARY KEY (id),
  CONSTRAINT quotation_versions_quotation_fk FOREIGN KEY (quotation_id)   REFERENCES rfq.quotations(id),
  CONSTRAINT quotation_versions_rfqver_fk    FOREIGN KEY (rfq_version_id) REFERENCES rfq.rfq_versions(id),
  CONSTRAINT quotation_versions_q_no_uq UNIQUE (quotation_id, version_no)  -- [§2.5] one row per (quotation, version)
);

-- Immutable (Doc-2 §10.4) — full append-only (all columns protected; DELETE blocked). Pass all cols as TG_ARGV (HR-1 lesson):
CREATE TRIGGER quotation_versions_immutable
  BEFORE UPDATE OR DELETE ON rfq.quotation_versions FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','quotation_id','rfq_version_id','version_no','price_breakdown_jsonb','currency','delivery_terms','warranty_terms',
    'attachments_refs','revision_reason','supersedes_version_no','created_at','created_by');  -- [Doc-6B §4]
```
- **`rfq_version_id` binding (Doc-2 §10.4):** a quotation version is bound to the **specific** `rfq_version` it answers — once that RFQ version is `is_immutable` (quoted), the binding is stable; a buyer scope change (new rfq_version) requires a fresh quotation revision. **Currency (QV-CUR):** amounts inside `price_breakdown_jsonb` are denominated in `currency` (R9 mandate; §10.4 omitted it, but §0.4 binds currency-per-value-field). **RLS:** inherits quotation visibility (§3.x). **Prisma [§2.5]:** `QuotationVersion`.

### §3.4.3 `rfq.quotation_visibility` (buyer-side read grant; composite PK; no SD)
Realizes Doc-2 §10.4. In-module FK → `quotations`; `grantee_organization_id` bare UUID → M1; PK (quotation_id, grantee_organization_id); **no SD**.

```sql
CREATE TABLE rfq.quotation_visibility (
  quotation_id            uuid NOT NULL,                         -- [Doc-6A §5.2] in-module FK
  grantee_organization_id uuid NOT NULL,                         -- [Doc-2 §10.4] bare UUID → M1 (buyer/grantee read anchor)
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT quotation_visibility_pkey PRIMARY KEY (quotation_id, grantee_organization_id),  -- [Doc-2 §10.4] composite PK
  CONSTRAINT quotation_visibility_quotation_fk FOREIGN KEY (quotation_id) REFERENCES rfq.quotations(id)
);
CREATE INDEX quotation_visibility_org_idx ON rfq.quotation_visibility (grantee_organization_id);  -- [§2.5] RLS anchor
```
- **Buyer-side read (Doc-2 §10.4):** on submission, the RFQ Service writes a visibility row granting the **RFQ owner buyer org** read of the vendor's quotation; representatives similarly. The vendor side reads via `controlling_organization_id`; the buyer side reads via this grant. **No SD** (revocation = hard DELETE if ever). **RLS:** grantee (own) OR the quotation's controlling org (the vendor sees who they shared with) OR admin (§3.x). **Prisma [§2.5]:** `QuotationVisibility`, `@@id([quotationId, granteeOrganizationId])`.

## §3.x — Consolidated RLS DDL (Pass-2 tables)
```sql
-- ===== routing_rules: admin/System only — NEVER buyer/vendor =====
ALTER TABLE rfq.routing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY routing_rules_admin ON rfq.routing_rules FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (the matching service evaluates rules via a SECURITY DEFINER path; no buyer/vendor policy.)

-- ===== matching_results: buyer-of-rfq + compliance read, NEVER vendor; service/admin write =====
ALTER TABLE rfq.matching_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY matching_results_buyer_read ON rfq.matching_results FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM rfq.rfqs r WHERE r.id = matching_results.rfq_id
                      AND r.organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY matching_results_admin_write ON rfq.matching_results FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (regeneration runs under the matching service's SECURITY DEFINER path; no vendor policy = competitor set stays buyer-side.)

-- ===== quotations: vendor (controlling org) all | buyer via visibility read | representative via grantee read | admin =====
ALTER TABLE rfq.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY quotations_vendor ON rfq.quotations FOR ALL
  USING (controlling_organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (controlling_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY quotations_admin ON rfq.quotations FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY quotations_buyer_read ON rfq.quotations FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.quotation_visibility v
                  WHERE v.quotation_id = quotations.id
                    AND v.grantee_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY quotations_rep_read ON rfq.quotations FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.rfq_invitation_grantees g JOIN rfq.rfq_invitations i ON i.id = g.invitation_id
                  WHERE i.rfq_id = quotations.rfq_id AND i.vendor_profile_id = quotations.vendor_profile_id
                    AND g.organization_id = current_setting('app.active_org', true)::uuid));

-- ===== quotation_versions: inherits quotation visibility (nested EXISTS); vendor (controlling org) write; admin =====
ALTER TABLE rfq.quotation_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY quotation_versions_read ON rfq.quotation_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.quotations q WHERE q.id = quotation_versions.quotation_id));  -- quotations' own RLS governs visibility
CREATE POLICY quotation_versions_vendor_write ON rfq.quotation_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM rfq.quotations q WHERE q.id = quotation_versions.quotation_id
                       AND q.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY quotation_versions_admin ON rfq.quotation_versions FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (UPDATE/DELETE blocked by the immutability trigger — no UPDATE/DELETE policy granted.)

-- ===== quotation_visibility: grantee (own) | quotation's controlling org | admin =====
ALTER TABLE rfq.quotation_visibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY quotation_visibility_grantee ON rfq.quotation_visibility FOR SELECT
  USING (grantee_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY quotation_visibility_owner ON rfq.quotation_visibility FOR SELECT
  USING (EXISTS (SELECT 1 FROM rfq.quotations q WHERE q.id = quotation_visibility.quotation_id
                   AND q.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY quotation_visibility_admin ON rfq.quotation_visibility FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
```
- **Nested-RLS note:** `quotation_versions_read`'s `EXISTS(quotations q …)` carries **no** org predicate — it relies on `quotations`' own RLS to filter the inner row (vendor/buyer/rep/admin). The version is visible iff the parent quotation is. Verified non-circular: `quotations` policies anchor on the simple `controlling_organization_id` + the `quotation_visibility`/grantee simple anchors.

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent. Verified CORRECT: the 5-table set + columns (Doc-2 §10.4), §5.5 6-state set verbatim, one-active partial-unique (§10.11 #7), `rfq_version_id` binding FK, composite PK on `quotation_visibility`, `QTN-` prefix (Doc-2 §0.1), gate-excluded-never-written discipline, matching buyer-side-only (RQ-HR-1), coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **MR-VENDOR** `matching_results` left vendor-readable would expose the scored passed-gate competitor set + defeat blacklist-undetectability | BLOCKER (Invariant #11/RQ-HR-1) | **FIXED** — §3.x: read = buyer-of-rfq OR compliance/admin only; **no vendor policy**; write = service SECURITY DEFINER. |
| **QV-CUR** `quotation_versions` carried money in `price_breakdown_jsonb` with no currency (CHK-6-050/R9) | MAJOR | **FIXED** — added `currency char(3) DEFAULT 'BDT'`; amounts denominated in it. R9/§0.4 mandate (currency per value field), not a coin. |
| **QVER-IMM** `quotation_versions` "immutable" asserted without a guard | MAJOR | **FIXED** — full append-only trigger via `core.raise_immutable_violation` with **all columns** as TG_ARGV (HR-1 lesson — empty args leave UPDATE open); DELETE blocked. |
| **RULES-COIN** `routing_rules` typed rule schema would be invented (Doc-2 gives only "rule definitions") | MAJOR | **FIXED** — `rule_definition_jsonb` interim carrier; **`[ESC-RFQ-SCHEMA-RULES]`** carried (bind via Doc-4E/Doc-5E or admin-runtime); params = POLICY-key refs, not literals. |
| **REP-READ** representative-org read path for a quotation under-specified | MINOR | **FIXED** — `quotations_rep_read`: EXISTS over `rfq_invitation_grantees` matched on (rfq_id, vendor_profile_id); the rep granted on the vendor's invitation reads the quote (Doc-2 §10.4). |
| **QVER-NEST** `quotation_versions` read nests `EXISTS(quotations)` — HQ-003 defeat risk | MINOR | **CONFIRMED safe** — relies on `quotations`' simple-anchor RLS; non-circular; documented; Doc-8 to assert. |
| **MR-REBUILD** `matching_results` regeneration semantics | NIT | **CONFIRMED** — derived/regenerable (Doc-6A R7): DELETE-by-`rfq_version` + INSERT; no SD, no immutability; not authoritative. |

**Net:** 1 BLOCKER (matching-results vendor-leak) + 3 MAJOR (currency, version immutability guard, routing-rules anti-coining) fixed; 2 MINOR + 1 NIT applied/confirmed. Quotation dual-sided RLS mirrors the RFQ side; matching stays buyer-side; coins nothing (routing-rules gap carried). 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6E Content Pass-2 (§3.2 Routing · §3.3 Matching · §3.4 Quotation AR + 2 children) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the routing config (params from POLICY, `[ESC-RFQ-SCHEMA-RULES]` carried), the derived matching read-model (gate-excluded never written; buyer-side-only — Invariant #11), and the Quotation aggregate (§5.5; one-active partial-unique; `rfq_version_id` binding FK; immutable versions with currency; buyer-side `quotation_visibility` read grant). Columns verbatim Doc-2 §10.4; state set §5.5 verbatim; coins nothing. Next: Pass-3 (Comparison `comparison_statements` + §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A).*
