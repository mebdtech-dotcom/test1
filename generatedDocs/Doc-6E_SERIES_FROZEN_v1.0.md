# Doc-6E — M3 RFQ Procurement Engine (`rfq`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6E Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M3 — RFQ Procurement Engine** (`rfq` schema) — **the moat**: the governed matching/routing engine + quotation; the **first dual-sided (buyer + vendor) grant-row RLS** module + the **first real in-scope blacklist-undetectable byte-equivalence** (Invariant #11) |
| Realizes | **Doc-2 §10.4** — **12 tables / 5 groupings** (2 ARs) as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with the frozen Doc-5E surface; consumes Doc-6B (`core`) + Doc-6C (`identity`, UUID) + Doc-6D (`marketplace`, UUID + service) |
| Freeze evidence | `Doc-6E_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 audit phases PASS. Cross-pass `Doc-6E_Content_Hard_Review_v1.0.md` — 0 BLOCKER/MAJOR; byte-equivalence verified end-to-end |

---

## Effective set (the authoritative Doc-6E)

| Artifact | Role |
|---|---|
| `Doc-6E_Structure_v1.0_FROZEN.md` | Frozen structure — RQ-CR1–CR12, 12-table partition, dual-sided grant-row RLS + non-disclosure model, 2 state machines, Appendix-A map |
| `Doc-6E_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6E_Content_v1.0_Pass1.md` | §0–§2 dual-sided RLS model · RFQ AR + 5 children (§5.4 control plane · grant-row anchors · version-immutability-once-quoted · blacklist-undetectable routing log) |
| `Doc-6E_Content_v1.0_Pass2.md` | Routing (`routing_rules`) · Matching (`matching_results` — gate-excluded never written, buyer-side-only) · Quotation AR + 2 children (§5.5 · one-active partial-unique · `rfq_version_id` binding FK) |
| `Doc-6E_Content_v1.0_Pass3.md` | Comparison (buyer-only) · §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37, 0 FAIL) |
| `Doc-6E_Content_Hard_Review_v1.0.md` | Cross-pass review — 0 BLOCKER/MAJOR; the blacklist-undetectable invariant verified end-to-end across all 12 tables; immutability re-checked vs Doc-6B §4 |
| `Doc-6E_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6E realizes (the `rfq` schema)

- **12 tables / 5 groupings** (Doc-2 §10.4), columns verbatim: RFQ (AR + 5 children), `routing_rules` (config), `matching_results` (derived), Quotation (AR + 2 children), `comparison_statements`.
- **First dual-sided buyer+vendor grant-row RLS** (Doc-2 §10.11 #9) — buyer `organization_id` anchor; vendor-side **materialized grant rows** (`rfq_invitation_grantees`/`rfq_document_grants`/`quotation_visibility`, `organization_id = active org`) + party columns (`quotations.controlling_organization_id`); the grant path covers RFQ + children; **never** cross-schema ownership traversal; nested RLS terminates at simple anchors; refresh-on-revocation (hard DELETE, audited).
- **Blacklist undetectable — first real in-scope byte-equivalence** (Invariant #11; CHK-6-022) — `matching_results` holds **only** vendors that passed every gate (gate-excluded never written); `rfq_routing_log` aggregate-only + **no vendor policy**; `matching_results`/`rfq_routing_log`/`comparison_statements` all **buyer-side-only**. A blacklisted vendor is never invited → no grant rows → its RFQ-side surface is byte-identical to a non-matched vendor's. The blacklist is M4's; served to routing via CRM service only; M3 never reads/persists it.
- **RFQ control plane (Invariant #4)** — `rfqs.state` §5.4 (13 states); `routing_mode` enum; `work_nature` **enum-array** (type enforces ⊆ {supply,service,fabricate,consult}); `estimated_value`+currency (A-05); `expired` = System timer (validity window in `core.system_configuration`); `closed_won` emits engagement (M4) + performance (M5) as consumer effects. M3 **owns** its decisions (the engine, not a reflector).
- **Quotation aggregate** — `quotations.state` §5.5 (6 states); **one-active partial-unique** `WHERE state IN ('draft','submitted')` (§10.11 #7); `quotation_versions` immutable + `rfq_version_id` **binding** cross-aggregate FK + `currency` (R9); buyer-side `quotation_visibility` read grant.
- **Version immutability** — `rfq_versions.is_immutable` set-on-first-quote (conditional rfq-local trigger: editable while draft, frozen once set, DELETE blocked); `quotation_versions`/`rfq_routing_log` full append-only via `core.raise_immutable_violation` (all-cols `TG_ARGV`); `comparison_statements` versioned.
- **Two `human_ref` carriers** — `rfqs` (`RFQ-…`) + `quotations` (`QTN-…`) via `core.allocate_human_ref` (Doc-2 §0.1 prefixes).
- **Cross-module = bare UUID, no cross-schema FK** (`vendor_profile_id`/`category_id`/`spec_document_ids[]`→M2; `organization_id`/user-ids/`controlling_organization_id`→M1; matching attrs via M2 service); in-module binding FKs; coins nothing.

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (2 machines) · `DR-6-API` (Doc-5E Band H) · DD-MKT/OPS/TRUST/BILL (service/event/UUID) · **Invariant #11** (realized — blacklist undetectable, in-scope CHK-6-022) · **`[ESC-RFQ-AUDIT]`** (routing/award audit actions vs Doc-2 §9 — bind nearest by pointer) · **`[ESC-RFQ-SCHEMA-RULES]`** (routing-rule schema underspecified — bind via Doc-4E/Doc-5E or admin-runtime; interim `rule_definition_jsonb`) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.1, 14 keys). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + **the in-scope non-disclosure byte-equivalence** + migration tests (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MAJOR + 2 MINOR + 1 NIT — incl. the `matching_results` vendor-leak fix protecting the moat's intel) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2/3 each per-pass-reviewed (routing-log blacklist leak, version-immutability-blocks-draft, matching-results vendor-leak, currency, routing-rules anti-coining, comparison vendor-leak) · **cross-pass Content Hard Review** (0 BLOCKER/MAJOR — the passes proactively applied the Doc-6D HR-1/HR-2 immutability + HQ-003 RLS lessons; the gate **verified** the blacklist-undetectable invariant end-to-end across all 12 tables) · Content Freeze Audit (PASS).

---

*Doc-6E (M3 `rfq` schema) is FROZEN. Realizes Doc-2 §10.4's 12 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A — the moat: first dual-sided buyer/vendor grant-row RLS + the blacklist-undetectable non-disclosure invariant's first real in-scope byte-equivalence; 2 state machines; reads vendor matching-attributes via service, owns the matching logic; coins nothing. Carried: Invariant #11 (realized) + `[ESC-RFQ-AUDIT]` + `[ESC-RFQ-SCHEMA-RULES]`. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6F (M4 `operations`) — post-award ops + the private Vendor CRM (the blacklist's owning side) + two-sided engagement + the money-record boundary.*
