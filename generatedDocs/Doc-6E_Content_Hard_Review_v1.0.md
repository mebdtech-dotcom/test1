# Doc-6E — M3 RFQ Engine (`rfq`) Schema Realization — **Content Hard Review v1.0** (cross-pass, full §0–§8 + Appendix A)

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** (Board Chair · Enterprise/DDD Architect · Security Architect · DBA · AI Coding Supervisor) — independent of the pass authors |
| Target | `Doc-6E_Content_v1.0_Pass1/2/3.md` (12 tables; §0–§8 + Appendix A) **read together** |
| Review type | **Cross-pass Content Hard Review** — the integration-seam gate (cross-pass DDL ordering, enum/function reuse vs the *actual* Doc-6B §4 body, the dual-sided nested-RLS interaction, and the **end-to-end byte-equivalence verification** of Invariant #11) |
| Basis | `Doc-2 v1.0.3 §10.4/§5.4/§5.5/§10.11`; `Doc-6A` (Appendix A); **`Doc-6B §4`** (the realized `core.raise_immutable_violation` body); Doc-6C (HQ-003 RLS lesson); Doc-6D (HR-1/HR-2 immutability lessons); Doc-3 v1.1 |
| Verdict | **0 BLOCKER + 0 MAJOR + 2 MINOR/NIT, dispositioned.** The headline byte-equivalence invariant verified end-to-end. **Ready for Content Freeze Audit.** |

> **Method note.** This review (a) verified the **end-to-end** blacklist-undetectable property across **all 12 tables' vendor-facing read surface** (not per-pass), (b) traced every nested RLS `EXISTS` to its terminating simple anchor (the Doc-6C HQ-003 failure class), and (c) re-checked every immutability attachment against the **actual Doc-6B §4 body** (the Doc-6D HR-1/HR-2 failure class). It found the passes had **proactively applied** the Doc-6D lessons — no immutability BLOCKER recurred. Two seams examined and dispositioned.

---

## 1 — Coverage (12/12)
| Pass | Tables | n |
|---|---|---|
| Pass-1 | rfqs · rfq_versions · rfq_invitations · rfq_invitation_grantees · rfq_document_grants · rfq_routing_log | 6 |
| Pass-2 | routing_rules · matching_results · quotations · quotation_versions · quotation_visibility | 5 |
| Pass-3 | comparison_statements | 1 |
| **Total** | = **Doc-2 §10.4 exactly** | **12** |

No 13th; none missing. **PASS.**

---

## 2 — Headline verification: blacklist-undetectable end-to-end (Invariant #11, CHK-6-022)
The whole vendor-facing read surface, traced for any exclusion signal:

| Table | Vendor read? | Blacklisted-vendor experience |
|---|---|---|
| `rfqs` / `rfq_versions` | only if invited (grantee EXISTS) | blacklisted ⇒ never invited ⇒ **no grantee row** ⇒ sees nothing |
| `rfq_invitations` | own, via grantee | none (uninvited) |
| `rfq_invitation_grantees` / `rfq_document_grants` | own (`org = active_org`) | none |
| `rfq_routing_log` | **no vendor policy** | invisible; `pipeline_counts_jsonb` aggregate-only |
| `routing_rules` | admin only | invisible |
| `matching_results` | **buyer-only** | **gate-excluded never written** |
| `quotations` / `quotation_versions` / `quotation_visibility` | own (controlling-org) | none (no invitation ⇒ no quote) |
| `comparison_statements` | **buyer-only** | invisible |

**The exclusion is structural, not signalled:** a blacklisted vendor is simply **never invited** → it receives **no grant rows** → its entire RFQ-side surface is **byte-identical** to a non-matched vendor's. The three buyer-side-only derived/log/ranking tables (`matching_results`/`rfq_routing_log`/`comparison_statements`) carry **no vendor policy at all**, so the pipeline itself is unqueryable by vendors. **Verified coherent across all 12 tables. CHK-6-022 PASS (first real in-scope).**

---

## 3 — Cross-pass integration checks

| Seam | Check | Result |
|---|---|---|
| **Nested RLS terminates** (HQ-003 class) | `rfqs_vendor_read` / `rfq_versions_vendor_read` / `quotations_rep_read` join grantees+invitations; the recursion bottoms out at the **simple** `rfq_invitation_grantees` anchor (`org = active_org`) — `invitations`' own vendor RLS resolves via the same grantee; no cycle, not defeatable | PASS |
| **`quotation_versions_read` via parent** | `EXISTS(quotations q WHERE q.id = quotation_id)` carries no org predicate by design — relies on `quotations`' simple-anchor RLS; tied to the specific parent; visible iff the quotation is | PASS |
| **Immutability vs Doc-6B §4 body** (HR-1/HR-2 class) | `rfq_routing_log` + `quotation_versions` attach `core.raise_immutable_violation` with **all columns** as `TG_ARGV` (full append-only — not the empty-args UPDATE-open bug); `rfq_versions` uses a **conditional** rfq-local trigger (core's guard is unconditional — correctly not reused); **no PERFORM-of-trigger-fn** | PASS (lessons applied) |
| **Enum singletons** | each `CREATE TYPE rfq.*` once; `routing_mode` (Pass-1) reused by `rfq_routing_log` (Pass-1); §7 creates all enums first | PASS |
| **Cross-aggregate in-module FK** | `quotation_versions.rfq_version_id → rfq_versions` (Doc-2-mandated "binding"); intra-schema; `rfq_versions` migrated before `quotation_versions` | PASS |
| **Money boundary** | `rfqs.estimated_value`+currency; `quotation_versions.currency` (R9); no bare-amount column; no buyer↔vendor money custody (award value is a snapshot, M4 owns engagement money) | PASS |
| **Coin-nothing across passes** | no coined state/enum/event/audit-action; `routing_rules` schema not invented (`[ESC-RFQ-SCHEMA-RULES]`); routing/award audit `[ESC-RFQ-AUDIT]` | PASS |
| **Appendix A** | 37/37 (Pass-3); N/A 033/062 justified; 043 PASS-with-carry; **022 in-scope PASS** | PASS |

---

## 4 — Findings (2; dispositioned)

### MINOR HR-E1 — `rfq_routing_log.applied_filter_ref` is an intra-schema reference left FK-less
`applied_filter_ref` points at `routing_rules` (same `rfq` schema), realized as a **bare UUID, no FK** (Pass-1). Doc-6A §5.2 prefers intra-schema FKs.
**Disposition: CONFIRMED bare-by-design (not a defect).** Doc-2 §10.4 lists it under the **"Ref"** column, **not "FK"**; `rfq_routing_log` is **append-only/permanent** while `routing_rules` is **soft-deletable/retirable** — the log records a **historical snapshot** of which rule applied and must outlive the rule's lifecycle without an FK constraint coupling an immutable audit row to a mutable config row. Optionally an FK could be added (routing_rules' soft-delete keeps the row), but the snapshot semantics are the correct realization. **Surfaced + justified; no change.**

### NIT HR-E2 — quote-insert invitation-gating is app-layer, not RLS
`quotations_vendor` permits a vendor to INSERT a quotation for its own controlling org; the rule "must have a delivered invitation to quote" is **not** in RLS.
**Disposition: CONFIRMED RLS-as-backstop (Doc-6A §4.5).** The invitation-gate is app-layer authorization (Doc-4E); the one-active-quotation partial-unique + app gating handle it. RLS deliberately carries no business-procedure logic. Doc-8 asserts the app-layer gate. **No change.**

---

## 5 — Decision

**0 BLOCKER, 0 MAJOR; 2 MINOR/NIT confirmed-by-design.** Unlike Doc-6D (2 BLOCKER), Doc-6E's passes **proactively applied** the accumulated lessons — immutability args (HR-1), no PERFORM-of-trigger-fn (HR-2), simple-anchor RLS (HQ-003), vendor-leak prevention on every derived/log/ranking table. The cross-pass gate's value here was **verification**: the blacklist-undetectable invariant holds **end-to-end across all 12 tables**, the dual-sided nested RLS terminates at simple anchors, the immutability attachments match the actual Doc-6B §4 contract, and coverage is 12/12.

**Authorized next step:** **Content Freeze Audit** → `Doc-6E_SERIES_FROZEN_v1.0` → fold corpus.

**Carried into the Freeze Audit:** `[ESC-RFQ-AUDIT]` (routing/award audit) · `[ESC-RFQ-SCHEMA-RULES]` (routing-rule schema) · the event-slug binding (`closed_won`/`VendorInvited` → Doc-2 §8/Doc-4L). None blocks freeze; all on named channels.

---

*End of Doc-6E Content Hard Review v1.0 (cross-pass). Evidence-verified against the frozen corpus incl. the Doc-6B §4 body. 0 BLOCKER/MAJOR; the blacklist-undetectable Invariant #11 verified end-to-end across all 12 tables (CHK-6-022 in-scope PASS); nested dual-sided RLS terminates at simple anchors; immutability matches Doc-6B §4; coverage 12/12. 2 MINOR/NIT confirmed-by-design. On any conflict, Doc-2 (the *what*) and Doc-6A (the *how*) win; flag-and-halt. Next: Content Freeze Audit → `Doc-6E_SERIES_FROZEN`.*
