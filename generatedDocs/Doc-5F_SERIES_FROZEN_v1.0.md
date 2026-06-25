# Doc-5F_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5F_SERIES_FROZEN_v1.0` |
| Status | **FROZEN** (with one applied additive Doc-3 §12.2 registration — `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations`, APPROVED; the `[ESC-OPS-POLICY]` content-freeze gate cleared) |
| Freeze Date | 2026-06-25 |
| Freeze Authority | `governanceReviews/Doc-5F_Freeze_Readiness_Audit_v1.0.md` — READY TO FREEZE (BLOCKER=0 · MAJOR=0 · MINOR=0; the sole content-freeze gate resolved by Patch v1.4) |
| Module | Module 4 — Business Operations (`operations` schema) — **the post-award ERP-Lite layer; where the non-disclosure + money-boundary firewalls are realized** |
| Realizes | `Doc-4F` (M4 contracts, FROZEN — 50 contracts: 46 caller-facing + 4 out-of-wire) on the bound HTTP transport |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5F — M4 API Realization. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content = the registered passes + resolved registers, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 · Doc-3 v1.0.2 (+ Policy-Key Patches v1.0/v1.1/v1.2/v1.3/v1.4) → Doc-4A–4M (FROZEN) → **Doc-5A (FROZEN)** · Doc-5B · Doc-5C · Doc-5D · Doc-5E · Doc-5G (FROZEN) → **Doc-5F** → Doc-5H…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 0 (review records carry methodology notes)
```

**Audit Status: READY TO FREEZE — one applied additive Doc-3 §12.2 registration (Patch v1.4), no open dependency**

**Governance Status: DOC-5F FROZEN**

Doc-5F is the per-module realization of **Module 4 — Business Operations, the post-award ERP-Lite layer**: it binds the frozen Doc-4F contracts to concrete HTTP endpoints under the `operations` route namespace (Contract-ID token `ops.<op>.v1`; R3 split), realizes the cross-cutting **two-sided tenant-User** actor / context / non-disclosure wire model (§3), and applies the out-of-wire boundary (R1) to the RFQ award/invitation System consumers, the async document-generation job, and the internal-service CRM-status read (§9). It realizes the 46 caller-facing endpoints across buyer-private CRM, post-award engagements & commercial documents, the vendor lead pipeline, document templates & generated documents, and finance records. It passes the Doc-5A **Appendix A** conformance checklist in full, with dedicated attestations for the **non-disclosure firewall (R5)** and the **money boundary (R8)**.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied resolutions |
|---|---|---|
| Canonical structure / TOC | `Doc-5F_Structure_v1.0_FROZEN.md` | R1–R10 + DF-1…DF-8 ratified at structure freeze (Board Hard Review + round-2 ADD-1/ADD-2; partition independently verified 46+4; history in `Doc-5F_Structure_Proposal_v0.1.md`) |
| §0 Document Control · §1 Scope & M4 Surface Partition · §2 Realized Endpoint Inventory (46) · §3 Cross-Cutting Two-Sided Actor / Context / Non-Disclosure Wire Model | `Doc-5F_Content_v1.0_Pass1.md` | BLOCKER-01 resolved (disclosure labels conformed to the frozen four — `Buyer-Org-Private`/`Vendor-Counterparty`/`Shared-Engagement`/`Internal-Service`); per-read disclosure + per-command actor-side binding rules (narrow-never-widen / never-broaden); `check_permission` sole authority + §6B; R5/R6/R8; realization-authority flag-and-halt rule (§0.4); `reference_id` + `[ESC-OPS-POLICY]` (pre-cleared) obligations; partition reconciles to 50 |
| §4 Buyer Private CRM (BC-OPS-1) · §5 Procurement Engagement & Commercial Documents (BC-OPS-2) | `Doc-5F_Content_v1.0_Pass2.md` | `active⇄archived` (no reactivation); buyer-vendor-status append-only, never disclosed/evented (R5); engagement/trade-invoice/payment machines (Doc-2 §3.5/§10.5); R8 money-boundary (records, not rails); R9 async `202` + `get_generated_document` source-of-truth; actor-sides frozen-sourced to Doc-4F §F5 (Either-party + `record_buyer_feedback` Buyer-only; §6B vendor-side); perf-input events → M0 outbox (R10); `reference_id` §4.4 nominated point (cross-cutting §5–§8) |
| §6 Vendor Lead Pipeline (BC-OPS-3) · §7 Templates & Generated Documents (BC-OPS-4) · §8 Finance Records (BC-OPS-5) · §9 Out-of-Wire Boundary · §10 Conformance & Carried Items · Appendix A Conformance Attestation | `Doc-5F_Content_v1.0_Pass3.md` | lead `received→quoted→negotiation→won|lost→follow_up` (vendor-side only, `Vendor-Counterparty`, §6B eligible, non-disclosure H.9); template §5.9 machine + immutable versions; async `202`/`get_generated_document` source-of-truth; document-grant the sole sharing channel; own-org Either (delegation not eligible) for §7/§8; `finance_records` no-lifecycle + immutable `record_type` + R8 records-not-rails; §9 protocol exclusion (REST/SSE/WS/webhook/GraphQL) + flag-and-halt; CHK-5A-121/071 → **cleared** by Patch v1.4; `[ESC-OPS-AUDIT]` governance note (not a gate, §10.3); dedicated non-disclosure + money-boundary attestations |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`; conformance gate: `Doc-5A Appendix A`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§10, then Appendix A).
2. **Apply resolutions** in place at their named section; the resolved wording supersedes the original pass text.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "Hard Review applied" status lines, and review notes.
4. **Anchors verbatim** — every `Doc-5A §X` / `Doc-4F §X` / `Doc-2` / `Doc-4M` / `Doc-4A` / `Doc-4C §C3/§C8` pointer is preserved exactly; reference-never-restate holds; **no buyer-CRM fact or funds-movement surface on any wire**.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5F amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Ratified Structural Decisions (carried from structure freeze)

| ID | Decision |
|---|---|
| **R1** | Out-of-wire boundary — 4 contracts (`create_engagement_on_award` ← `RFQClosedWon`; `create_lead_on_invitation` ← `VendorInvited`; `generate_document` async job; `read_crm_status_for_routing` internal-service) have no caller wire (§9). Caller `202` exists for async doc-gen enqueue (R9). |
| **R2** | Two-sided tenant-User surface — User(buyer) + User(vendor), server-validated `Iv-Active-Organization`; no Admin (21.6), no public/anonymous; System out-of-wire. |
| **R3** | `operations` route prefix; `ops.<op>.v1` Contract-ID token; `ops_` error prefix (deliberate split — path grammar derives from `operations`, never the `ops.` stem; Doc-5A App B.1; Doc-2 §0.3). |
| **R4** | No token invented — Doc-2 §7 slugs / §9 audit / §8 events / Doc-3 §12.2 keys; carried gaps (`[ESC-OPS-SLUG]`/`[ESC-OPS-AUDIT]`/`[ESC-OPS-POLICY]`) escalated. |
| **R5** | Non-disclosure firewall (Invariant #11, load-bearing) — buyer-vendor-status + buyer-private CRM never disclosed, never evented; lead surface leaks no routing/competitor/ranking/deferral; uniform `NOT_FOUND` collapse; sole CRM-status egress (`read_crm_status_for_routing`) out-of-wire; blacklist ≡ non-match. |
| **R6** | Governance-signal firewall — Operations stores no trust/performance/verification/tier signal and no matching/eligibility; emits performance *inputs* only → outbox; Buyer Vendor Status never mutates a platform-wide score. |
| **R7** | Post-award seam — Operations owns no procurement decision; `engagements` created only by the `RFQClosedWon` consumer, `vendor_leads` only by the `VendorInvited` consumer (both out-of-wire). |
| **R8** | Money boundary — records, not rails (DF-6); `trade_invoices`/`payment_records`/`finance_records` ≠ `billing.platform_invoices`; no funds movement/escrow/settlement/gateway on any wire. |
| **R9** | Async document generation (Doc-5A §10) — enqueue returns `202`; `get_generated_document` is the status-resource source of truth (`ASYNC_PENDING`); dedup on `generation_job_id`; counterparty access via explicit grant. |
| **R10** | Event surface via outbox, not webhook — BC-OPS-2 performance-input events (Doc-2 §8, by pointer) → M0 outbox; no caller webhook/push; notification dispatch rides Communication (DF-7). |

## Realization Conventions (§0.4 — frozen-sourced, within Doc-5F authority)

- **`archive_private_vendor` / `archive_template` → `POST` named state command** (not ADR-012 soft-delete; `active → archived` edge — Doc-4F §F4.3 / §F7; `archived → active` exists only for templates via `reactivate_template`).
- **Append children (`add_private_vendor_note`, `add_lead_activity`, `add_template_version`) → `POST` sub-collection `201`** (immutable child rows; Doc-2 §5.9 versions never overwritten).
- **Async doc-issue (`issue/revise_engagement_document`) → `POST` `202`**; `get_generated_document` is the canonical Doc-5A §10 polling resource; `get_engagement_document` is the request record showing `ASYNC_PENDING` as a body-state field (Doc-4F §F7.3).
- **Actor-sides frozen-sourced (Doc-4F §F5/§F6/§F7/§F8):** BC-OPS-2 mostly `Either party` (§6B vendor-side eligible), `record_buyer_feedback` Buyer-only; BC-OPS-3 Vendor-only (§6B eligible); BC-OPS-4/5 own-org Either (delegation not eligible).

## Open Carried Items (non-gate) & Applied Patch

| ID | Item | Status |
|---|---|---|
| **DF-1…DF-5 · DF-7 · DF-8** | Identity / Marketplace / RFQ / Trust / Admin / Communication / Platform Core integrations | OPEN — consumed in-process / out-of-wire (§9) / via outbox |
| **DF-6** Billing (money boundary) | OPEN — `operations.*` finance/invoice/payment ≠ `billing.platform_invoices`; records-not-rails (R8); no settlement on any wire |
| `[ESC-OPS-SLUG]` | OPEN — all commands bind existing Doc-2 §7 slugs; carried only against a future distinct read slug; never invented |
| `[ESC-OPS-AUDIT]` | OPEN — Structure FROZEN ruling (Freeze gate? No); lead/doc-grant/finance-record actions bind nearest Doc-2 §9 action by pointer (§10.3); never invented |
| `[ESC-OPS-POLICY]` (wire keys) | **RESOLVED** — `operations.idempotency_dedup_window` + `operations.list_page_size_max` registered in Doc-3 §12.2 via approved `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations` (new `operations` namespace; Doc-4A §18.2) |

**Applied corpus patch (ratification dependency, satisfied):** `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations` — additive §12.2 registration of `operations.idempotency_dedup_window` + `operations.list_page_size_max` (new `operations` namespace); Status APPROVED (human owner, 2026-06-25). Additive only; no Doc-3 semantic/procurement/money/governance/ownership change; non-disclosure + money-boundary + governance-signal firewalls preserved. Review evidence: `governanceReviews/Doc-5F_Freeze_Readiness_Audit_v1.0.md`.

---

## Downstream Effect

Doc-5F is the binding API-realization layer for **Module 4 — Business Operations, the post-award ERP-Lite layer**. It establishes the **non-disclosure firewall** (R5 — buyer-CRM never disclosed; lead surface leaks no routing/competitor; blacklist ≡ non-match; CRM-status egress out-of-wire — the highest-stakes R1/R5 application) and the **money boundary** (R8 — records, not rails; no funds-movement surface) as wire invariants, plus the post-award seam (R7) and the async document-generation pattern (R9). Each remaining Doc-5x (Doc-5H Communication, Doc-5I Billing, Doc-5J Admin, Doc-5K…5M) is gated at freeze by the Doc-5A Appendix A checklist. Doc-6 (DB) / Doc-7 (Frontend) / Doc-8 (Tests) planning may proceed in parallel.

---

*Doc-5F program freeze designation. Non-authoring. On any conflict, the registered frozen sources, Doc-5A (FROZEN), and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*
