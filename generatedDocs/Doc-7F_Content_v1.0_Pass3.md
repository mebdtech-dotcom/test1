# Doc-7F — Buyer Workspace — **Content Pass-3 (§8–§10 + Appendix)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-3 (DRAFT)** — realizes §8–§10 + Appendix of `Doc-7F_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7F FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7F_Structure_v1.0_FROZEN` §8–§10 + Appendix; FR7 (§8) · FR9/FR10 (§9) · FR11/FR12 (§10) |
| Carries forward | Pass-1/2 (discovery/RFQ/observability/quotation/comparison/award/post-award); the moat |
| Posture | Reference-never-restate; mechanism only. Coins **nothing** |

> **Scope:** buyer-private CRM — never leaks (§8), state-machine UI / firewall / non-disclosure (§9), composition / data / authz / baseline / conformance (§10), view/contract-binding skeleton (Appendix).

---

## §8 — Buyer-Private CRM *(mechanism only; Doc-5F BC-OPS-1; Invariant #11; `CHK-7-040`)*

### §8.1 Binding (buyer's private vendor records)
Bind BC-OPS-1 (Buyer User): `create_private_vendor`, `update_private_vendor`, `archive_private_vendor`, `add_private_vendor_note`, `set_private_vendor_rating`, **`set_buyer_vendor_status`** / **`clear_buyer_vendor_status`** (approved/blacklisted), `set_vendor_favorite`/`clear_vendor_favorite`, `confirm_vendor_link`/`dismiss_vendor_link` + reads (`get_private_vendor`, `list_private_vendors`, `get_buyer_supplier_relationship`).

### §8.2 Renders ONLY in the buyer's own workspace — never leaks (Invariant #11)
The buyer-private CRM (status / notes / rating / approved / blacklist) renders **only inside this buyer's own workspace** and **never** appears in any vendor-facing surface (Doc-7G), shared embedded component, notification, count, analytic, or error. **No vendor can detect a buyer's private status** — the blacklist is **undetectable** (the byte-equivalence attestation is Doc-7G's; here, the CRM is private to the buyer). This is **load-bearing** (`Doc-5F R5` non-disclosure; Invariant #11).

### §8.3 Buyer status never mutates platform-wide scores (firewall)
**Buyer Approved/Blacklisted is a private per-buyer signal** that **never mutates a platform-wide score** (Trust / Performance / Financial Tier — governance firewall; M4 CRM holds private status, M5 owns platform scores). The CRM UI shows the buyer's private view; it never writes a governance signal.

### §8.4 Private exclusion influences only this buyer's routing — invisibly (R5)
A blacklisted vendor is **privately excluded from this buyer's RFQ routing** via the internal-service **`read_crm_status_for_routing`** (`Doc-5F` §9 **out-of-wire** — the routing engine reads CRM status; non-disclosure DF-3/R5). The **frontend never invokes `read_crm_status_for_routing`** and never sees its use; the exclusion is applied **server-side, invisibly**, so neither the excluded vendor nor any surface can detect it (Invariant #11 — private exclusion stays private, forever).

---

## §9 — State-Machine UI, Firewall & Non-Disclosure *(mechanism only)*

### §9.1 State machines (Doc-4M; FR9)
Every lifecycle surface — RFQ (incl. internal approval), quotation viewing, award/closure, engagement, commercial documents, templates — renders **only Doc-4M-permitted, Buyer-actor transitions** (`Doc-7A §7`). **System transitions** (matching/routing/wave assembly/`expire_rfq`/comparison generation/engagement creation/document generation) are **displayed, never invoked** (out-of-wire). STATE/CONFLICT (409) → reconcile.

### §9.2 Firewall (R6/R7; FR10)
- **R6 — no auto-decision:** the UI (and the AI panel — §10) never auto-recommends/ranks-to-winner/auto-selects; `award_rfq` is a deliberate, unranked buyer choice.
- **R7 — payment firewall:** no payment/entitlement/plan value influences matching/routing/selection or its display; the **billing/quota indicator shows a delivery ceiling only** (three-instrument identity `Doc-3 §4.1.1`), **never a matching-eligibility gate** and never presents a vendor as excluded-by-quota.

### §9.3 Non-disclosure (R5; Invariant #11)
- Routing/matching reads are **non-disclosing explainability** (positive outcome only; excluded vendors never shown — Pass-2 §4.3).
- Quotation reads are **`quotation_visibility`-gated**; cross-tenant/protected → `NOT_FOUND` (`Doc-5A §6.3`).
- The **buyer-private CRM never leaks** (§8); private exclusion is invisible (§8.4).
- All reads are **own-org / visibility-gated**; the buyer sees only its own org's procurement.

---

## §10 — Composition, Data, Authz, Baseline & Conformance *(mechanism only)*

### §10.1 Composed embedded components (Doc-7B; `CHK-7-005`)
- **Trust badge** (`Doc-5G`) on vendors/quotations (public/User trust read).
- **Billing/quota indicator** (`Doc-5I`) — **delivery ceiling only** (R7), never an eligibility gate.
- **AI advisory panel** (`Doc-5K`) — advisory only; **NEVER a winner recommendation / ranking-to-winner / auto-selection** (R6; Invariant #12); summarize/draft/explain only.
- **Conversation thread** (`Doc-5H`) — RFQ/clarification thread; non-disclosure-bound.

### §10.2 Data, authz, baseline
- **Data** via the Doc-7C **server-side wired client** (`Doc-7C §5`): reads (RSC) + writes (server actions + stable idempotency key); cursor pagination + POLICY `page_size`; error→state by `error_class`; the browser holds no credential.
- **Authz** UX gating on buyer slugs (RFQ/operations/CRM) is **UX over server enforcement** (`Doc-7A §4.3`); read via contract, never name-string (Invariant #10).
- **Baseline** (Doc-7B §7): WCAG-AA, i18n-ready, **currency-per-field default BDT** on RFQ values / quotations / trade invoices / finance records (`Doc-2 §0.4`), responsive.

### §10.3 Applicable Appendix A (full surface)
| CHK | Status | Reason |
|---|---|---|
| `CHK-7-001/002/003/004` | **APPLIES** | reads + commands across RFQ/ops/CRM |
| `CHK-7-005` | **APPLIES** | trust badge / quota indicator / AI panel / thread |
| `CHK-7-010/011/012` | **APPLIES** | org-scoped (Buyer/Hybrid); UX gating; Hybrid mounts Buyer+Vendor (with Doc-7G) |
| `CHK-7-020/021` | **APPLIES** | Content≠Presentation; display never re-ranks M3 |
| `CHK-7-030/031` | **APPLIES** | RFQ/quotation/award/engagement/doc lifecycles |
| `CHK-7-040/041/042` | **APPLIES** | buyer-private CRM never leaks; quotation visibility; NOT_FOUND collapse |
| `CHK-7-050/051` | **APPLIES** | AI advisory non-authoritative, **non-recommending** (R6) |
| `CHK-7-060/061/062/063` | **APPLIES** | baseline; currency |
| `CHK-7-070/071` | **APPLIES** | out-of-frontend; doc generation System; media as `file_ref` |
| `CHK-7-080/081` | **APPLIES** | realize-never-redecide; engine never invoked |

### §10.4 Carried items
`DR-7-SHELL` · `DR-7-API` (Buyer-leg bindings; `[ESC-7-API]` on a gap — incl. the file-upload grant from Doc-7C) · `DR-7-STATE` (Doc-4M). Resolved only via named channels.

### §10.5 Coins nothing
Binds frozen Buyer-leg by pointer; view/route names are presentation vocabulary; **never invokes the engine**; no domain/API element introduced (FR12).

---

## Appendix — View / Contract-Binding Skeleton *(names = presentation vocabulary; bound contracts frozen)*

| View | Bound frozen contract(s) | Notes |
|---|---|---|
| Discovery (vendor search / directory / favorites) | `search_catalog`/`list_vendor_directory` (Doc-5D) · `*_catalog_favorite` (BC-MKT-7) | research/reference; trust badge |
| RFQ authoring & internal approval | `create_/update_/submit_/approve_/reject_internal_/cancel_/reissue_rfq` + reads (Doc-5E §4) | role-gated approval |
| Routing & invitation observability | `get_routing_log`/`get_invitation`/`list_invitations` (Doc-5E §7) | engine out-of-wire; positive-only |
| Quotation viewing | `get_quotation`/`list_quotations_for_rfq` (Doc-5E §5) | visibility-gated |
| Comparison & award | `get_comparison_statement`/`shortlist_quotation`/`manage_clarification`/`invoke_best_and_final`/`award_rfq`/`close_lost_rfq` (Doc-5E §6) | **no auto-decision** |
| Post-award operations | BC-OPS-2 **buyer-leg** + BC-OPS-4 (templates/grants) + BC-OPS-5 (finance) | engagement System-created; money = records (R8) |
| Buyer-private CRM | BC-OPS-1 (Doc-5F §4) | **never leaks** (Inv #11) |
| Embedded | trust badge · quota indicator · AI panel (non-recommending) · M6 thread | composed from Doc-7B/7C |

Exact pages/routes realized with the implementation; Doc-7F fixes the **view inventory + bindings**.

---

## Pass-3 self-check (pre-review)

- **Buyer-private CRM never leaks** (§8.2/§8.4); `read_crm_status_for_routing` is internal-service, never frontend-called; private exclusion invisible (Inv #11).
- **Firewall held** (§9.2): R6 no-auto-decision (incl. AI); R7 quota = delivery ceiling.
- **§10.3 vs FR11:** full Appendix A applies (richest surface).
- **Coins nothing:** Appendix names presentation vocabulary; bound contracts frozen; engine never invoked.
- **Open for review:** confirm `set_buyer_vendor_status` (blacklist) + `read_crm_status_for_routing` is the complete private-exclusion mechanism (no frontend leak path); confirm `confirm_vendor_link`/`dismiss_vendor_link` are buyer-private (link suggestions — M8/M4 non-disclosure).

*End of Content Pass-3 (§8–§10 + Appendix) — DRAFT. Realizes `Doc-7F_Structure_v1.0_FROZEN` §8–§10 + Appendix. Nothing coined; buyer-private CRM never leaks; engine never invoked. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7F FROZEN.*
