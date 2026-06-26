# Doc-6D — M2 Marketplace (`marketplace`) Schema Realization — **Content Hard Review v1.0** (cross-pass, full §0–§8 + Appendix A)

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** (Board Chair · Enterprise/DDD Architect · Security Architect · DBA · AI Coding Supervisor) — independent of the pass authors |
| Target | `Doc-6D_Content_v1.0_Pass1.md` + `Pass2.md` + `Pass3.md` (21 tables; §0–§8 + Appendix A) **read together** |
| Review type | **Cross-pass Content Hard Review** — the gate that catches defects invisible to per-pass review (the integration seams: cross-pass DDL ordering, enum/function reuse against the *actual* Doc-6B signatures, RLS subquery interaction across tables, coverage) |
| Basis | `Doc-2 v1.0.3 §10.3/§5.3/§5.8/§6` (the *what*); `Doc-6A` (the *how* + Appendix A); **`Doc-6B §4` (the realized `core.raise_immutable_violation` signature)**; Doc-6C (intra-schema RLS lessons); Doc-3 v1.2 |
| Verdict | **2 BLOCKER + 0 MAJOR + 2 NIT found and dispositioned. Both BLOCKERs FIXED in the pass files.** After fix: 0 open BLOCKER/MAJOR/MINOR → **ready for Content Freeze Audit** |

> **Method note.** This review deliberately did what the three per-pass reviews structurally could not: it read the **actual frozen Doc-6B §4 source** for `core.raise_immutable_violation` and traced every M2 call site against it, and it walked each child-table RLS subquery against the *parent* table's own RLS (the Doc-6C HQ-003 failure class). That cross-document tracing is where both BLOCKERs lived — each pass, reviewed in isolation, read clean.

---

## 1 — Coverage (21/21)
| Pass | Tables | n |
|---|---|---|
| Pass-1 | vendor_profiles · vendor_capacity_profiles · declared_financial_tiers · category_assignments · financial_tier_history · vendor_ownership_history · vendor_matching_attributes · vendor_claim_records | 8 |
| Pass-2 | categories · products · spec_library_entries · spec_documents · product_spec_links · microsites · profile_sections · branding_assets · seo_settings · custom_domains | 10 |
| Pass-3 | advertisements · showcase_projects · catalog_favorites | 3 |
| **Total** | = **Doc-2 §10.3 exactly** | **21** |

No 22nd table; no Doc-2 table missing; vendor-favorites correctly **M4's**, not realized here. **PASS.**

---

## 2 — Findings

### BLOCKER HR-1 — history immutability triggers blocked DELETE only, not UPDATE
**Where:** Pass-1 §3.1.5 `financial_tier_history`, §3.1.6 `vendor_ownership_history`.
**Defect:** both triggers were attached as `EXECUTE FUNCTION core.raise_immutable_violation()` **with no arguments**. Per the realized Doc-6B §4 body, the function blocks `DELETE` unconditionally **but** checks immutability by looping `FOREACH col IN ARRAY TG_ARGV` — **empty `TG_ARGV` ⇒ the loop body never runs ⇒ an UPDATE raises nothing ⇒ UPDATE is permitted.** The tables Doc-2 §10.3 marks "NO (permanent)" were therefore **not** append-only against UPDATE — a silent integrity hole. Per-pass review asserted "append-only via core's raiser" without checking the function's arg contract.
**Fix (applied):** attach with the protected payload/identity columns as `TG_ARGV` (the `audit_records` pattern from Doc-6B §4) — **omitting the temporal-close column** (`effective_to` / `valid_to`), which is legitimately set once on supersession (the SCD close; `WHERE … IS NULL` = current-row index). Result: rows permanent (DELETE blocked), payload immutable, interval closable. **VERIFIED** against the Doc-6B body.

### BLOCKER HR-2 — `spec_documents` immutability wrapper `PERFORM`-ed a trigger function (invalid)
**Where:** Pass-2 §3.3.3 `spec_documents`.
**Defect:** the realization defined `marketplace.spec_documents_revision_immutable() RETURNS trigger` and, inside it, called `PERFORM core.raise_immutable_violation()`. `core.raise_immutable_violation` is itself a **`RETURNS trigger`** function (Doc-6B §4) — PostgreSQL **rejects** calling a trigger function outside trigger context: *"trigger functions can only be called as triggers."* The migration would fail at first UPDATE/DELETE. The wrapper also **reinvented** the per-column comparison that core's generic guard already performs via `TG_ARGV` — a reference-never-restate violation.
**Fix (applied):** delete the wrapper; attach `core.raise_immutable_violation` **directly** as the trigger with the protected content columns as `TG_ARGV`, **omitting `is_active_revision`** (+ `updated_at`/`updated_by`) — the only mutable columns (toggled on supersession). Column-scoped immutability, DELETE blocked, zero M2-local function. **VERIFIED.**

### NIT HR-3 — temporal-close columns: state the bounded-mutable contract explicitly
`effective_to`/`valid_to` (history) and `is_active_revision` (spec) are now the **omitted-from-`TG_ARGV`** columns. Documented inline in each fix so a future reader sees *why* they are mutable on otherwise-immutable rows (SCD interval close / active-revision flip). No code change beyond the comments. **Resolved.**

### NIT HR-4 — `category_assignments` deferred FK now redundant (harmless)
Pass-1 deferred `category_assignments_category_fk` (DDL-1) because `categories` did not yet exist when Pass-1 was authored. Pass-3 §7 migration orders `categories` **before** the §3.1 children, so the FK could be inlined. The deferred `ALTER` remains **valid and correct** (idempotent, forward-only) — left as-is to avoid churning a reviewed pass; flagged only so the migration author may inline it. **No fix required.**

---

## 3 — Cross-pass integration checks that PASSED (the seams)

| Seam | Check | Result |
|---|---|---|
| **Enum singletons** | each `CREATE TYPE marketplace.*` defined once; `financial_tier` (Pass-1 §3.1.3) reused by `financial_tier_history` + `vendor_matching_attributes` — intra-module reuse, defined before use; §7 creates all enums first | PASS |
| **RLS subquery vs parent RLS** (HQ-003 class) | child `EXISTS(marketplace.vendor_profiles p WHERE …)` is subject to `vendor_profiles` RLS: the **org** sees its own profile via `vendor_profiles_org_read`; the **public** sees public profiles via `vendor_profiles_public_read` → the child predicates resolve, **not** defeated (unlike Doc-6C memberships) | PASS |
| **Ban visibility consistency** | banned vendor remains public-readable (banner) → its published products/sections also publicly readable under the banner; routing/search exclusion is the read-model/FTS layer, not base RLS — internally consistent with the §2.3 / DD-3 decision | PASS (by-design) |
| **Deferred-FK closure** | `category_assignments_category_fk` deferred (Pass-1) → categories realized (Pass-2) → closed in §7 step 4 (Pass-3) | PASS |
| **Score firewall end-to-end** | no score column on any of the 21 tables; bands only reflected in `vendor_matching_attributes`; `financial_tier_history` M2-exclusive-writer (Trust never writes); matching read-model admin-only RLS | PASS |
| **Money boundary** | only `vendor_capacity_profiles.max_project_value` is monetary (NUMERIC + `char(3)` currency); ad money is M7's `platform_invoice` by reference; no buyer↔vendor money custody | PASS |
| **Coin-nothing across passes** | no `categories.status`, no `showcase_projects.status`, no `buyer_private`, no coined event/audit-action/POLICY-key; gaps carried as `[ESC-*]` | PASS |
| **Carried-register continuity** | `[ESC-6-DD7]`, `[ESC-MKT-AUDIT]`, `[ESC-6-SCHEMA-SHOWCASE]`, `'VENDOR'` prefix, ADV-PURCH erratum — all named, none resolved locally | PASS |
| **Appendix A** | 37/37 attested (Pass-3); N/A justified (022/033/062); PASS-with-carry 043 | PASS |

---

## 4 — Decision

**2 BLOCKER found, both FIXED in the pass files; 2 NIT resolved/flagged. 0 open BLOCKER/MAJOR/MINOR.**

The two BLOCKERs were genuine, executable-migration-breaking, cross-document defects — exactly the integration class this gate exists to catch (the per-pass reviews could not, having never opened the Doc-6B §4 body). After fix, the immutability realization is correct against the *actual* `core.raise_immutable_violation` contract (append-only history = all-cols-minus-close; spec versioning = all-content-cols-minus-active-flag; DELETE blocked everywhere; zero M2-local immutability function), the cross-table RLS is non-defeating, coverage is 21/21, and the firewalls/money-boundary/coin-nothing disciplines hold across all three passes.

**Authorized next step:** **Content Freeze Audit** (the freeze-readiness gate) → `Doc-6D_SERIES_FROZEN_v1.0` → fold corpus.

**Carried into the Freeze Audit:** `[ESC-6-DD7]` (claim-records tenancy) · `[ESC-MKT-AUDIT]` (ad/product audit) · `[ESC-6-SCHEMA-SHOWCASE]` (showcase columns) · `'VENDOR'` `human_ref` prefix (§2.5 — confirm) · ADV-PURCH (structure annotation erratum, additive). None blocks freeze; all on named channels.

---

*End of Doc-6D Content Hard Review v1.0 (cross-pass). Evidence-verified against the frozen corpus, including the realized Doc-6B §4 trigger-function body. 2 BLOCKER (history UPDATE-open; spec PERFORM-of-trigger-fn) found and FIXED; coverage 21/21; cross-table RLS non-defeating; firewalls intact; coins nothing. On any conflict, Doc-2 (the *what*) and Doc-6A (the *how*) win; flag-and-halt. Next: Content Freeze Audit → `Doc-6D_SERIES_FROZEN`.*
