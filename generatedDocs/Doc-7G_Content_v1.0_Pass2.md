# Doc-7G — Vendor Workspace — **Content Pass-2 (§6–§11 + Appendix)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §6–§11 + Appendix of `Doc-7G_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7G FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7G_Structure_v1.0_FROZEN` §6–§11 + Appendix; GR6 (§6) · GR7 (§7) · GR8 (§8) · GR9 (§9) · GR10/GR11 (§10) · GR12 (§11) |
| Carries forward | Pass-1 §2–§5 (profile/microsite/catalog/ads); the byte-equivalence attestation |
| Posture | Reference-never-restate; mechanism only. Coins **nothing** |

> **Scope:** invitation inbox & response (§6), quotation authoring/versioning (§7), lead pipeline (§8), post-award vendor-leg (§9), **state-machine & byte-equivalence non-disclosure — the load-bearing attestation** (§10), composition/data/conformance (§11), skeleton (Appendix).

---

## §6 — Invitation Inbox & Response *(mechanism only; Doc-5E §5 vendor)*

### §6.1 Binding
Bind **`respond_to_invitation`** (accept/decline) + invitation reads **`get_invitation`** / **`list_invitations`** (vendor leg). The inbox lists invitations the vendor **received** to RFQs; the vendor accepts or declines.

### §6.2 Byte-equivalence (GR11)
**The inbox shows ONLY invitations received.** There is **no "you were excluded / not invited / not matched" signal** — the vendor never sees the routing decision that did or did not invite it. A blacklisted vendor and a non-matched vendor see the **same** (empty-or-fewer) inbox; the difference is **undetectable** (Invariant #11). Reads are own-org; a cross-tenant/protected read → `NOT_FOUND`.

---

## §7 — Quotation Authoring & Versioning *(mechanism only; Doc-5E §5 vendor)*

### §7.1 Binding
Bind **`submit_quotation`**, **`revise_quotation`**, **`withdraw_quotation`**, **`request_late_extension`** + reads **`get_quotation`** / **`list_quotations_for_rfq`** (vendor leg, **`quotation_visibility`-gated**). The vendor authors a quotation against an invited RFQ, revises, withdraws, or requests a late extension.

### §7.2 Versioning (Invariant #8)
`revise_quotation` creates a **new version**; the prior quotation is **never overwritten** (Invariant #8). The UI surfaces version history read-only; the state machine renders per Doc-4M (draft → submitted → revised → withdrawn/awarded/closed). STATE/CONFLICT (409) → reconcile.

### §7.3 Visibility-gated; the vendor sees only its own quotations
`quotation_visibility`-gating means the vendor sees **only its own** quotations; it **never** sees another vendor's quotation, the buyer's comparison ranking, or the award reasoning. The comparison/award is the buyer's (Doc-7F); the vendor sees only the **outcome** of its own quotation (awarded / not-awarded) per Doc-4M, never a competitive ranking.

---

## §8 — Lead Pipeline *(mechanism only; Doc-5F BC-OPS-3 vendor)*

### §8.1 Binding
Bind **`update_lead_stage`**, **`add_lead_activity`** + reads **`get_lead`** / **`list_leads`**. The vendor manages its own sales pipeline over the leads it received.

### §8.2 Leads are System-created on invitation (R7 seam)
**A lead is created by the System** consumer of `VendorInvited` (`create_lead_on_invitation`, §9 out-of-wire — `Doc-5F R7`); the **vendor does not create leads** (a lead = an RFQ invitation the vendor received). The vendor manages the lead's stage/activity after it exists.

### §8.3 Byte-equivalence (GR11)
**The pipeline shows only received leads.** **Absence of a lead is non-disclosed** — it could be a non-match **or** a private buyer exclusion; the two are **undetectable** (Invariant #11). The vendor never sees which buyers considered-but-excluded it, nor any buyer's private CRM/blacklist.

---

## §9 — Post-Award Vendor-Leg *(mechanism only; Doc-5F BC-OPS-2/4/5 vendor; money-boundary R8)*

### §9.1 Engagement & commercial documents (BC-OPS-2 vendor-leg)
Bind the **vendor-leg**: **`issue_trade_invoice`** (the vendor bills the buyer), vendor-issued documents (delivery **challan** via `issue_engagement_document` vendor leg), **`record_delivery`**, vendor-side trade-invoice status + reads (`get_engagement`/`list_engagements`/`get_engagement_document`). **Buyer-side approval (`update_trade_invoice_status` buyer leg, `record_payment`/`confirm_payment`) is Doc-7F.** The engagement is **System-created on award** (`create_engagement_on_award`, out-of-wire — R7); the vendor manages its leg after.

### §9.2 Money-boundary (R8)
**The platform handles no buyer↔vendor money** (`Doc-5F R8`): `issue_trade_invoice` and the documents create **records / workflow**, **never settlement / escrow / custody / fund movement**. A **trade invoice is an operations record (≠ the platform billing invoice** — `Doc-5I R6`, Doc-7E). The vendor records that it invoiced/delivered; the platform never moves money.

### §9.3 Templates & finance (BC-OPS-4/5 vendor-leg)
Bind vendor templates (`create_template`/`add_template_version`/`activate_template`/etc.) + generated-document grants + finance records (BC-OPS-5). **`generate_document` is System async (out-of-wire)** — triggered by a vendor command, read via the grant model; the UI never calls it. Currency-per-field default BDT (`Doc-2 §0.4`).

---

## §10 — State-Machine UI & Byte-Equivalence Non-Disclosure *(the load-bearing attestation)*

### §10.1 State machines (Doc-4M; GR10)
Profile claim, microsite publish, ad, quotation, lead, engagement lifecycles render **only Doc-4M-permitted Vendor transitions** (`Doc-7A §7`); **System transitions** (matching/routing/lead-creation/engagement-creation/doc-generation) are **displayed, never invoked** (out-of-wire). STATE/CONFLICT (409) → reconcile.

### §10.2 Byte-equivalence — THE load-bearing attestation (Invariant #11; `CHK-7-040`)
A blacklisted/excluded vendor's experience is **byte-equivalent** to a non-matched vendor's. The vendor sees only **positive facts** (invitations received, quotations submitted, leads received, awards won on submitted quotations); **absence is uniformly non-disclosed** across every surface — inbox (§6), pipeline (§8), quotation outcomes (§7), notifications, and analytics.

### §10.3 Analytics guard (the highest-risk vector)
**Vendor analytics/metrics expose only positive facts.** A **win/conversion-rate denominator is the vendor's submitted quotations (or received invitations) — NEVER all-matchable RFQs.** **No metric, count, chart, or export includes a count of RFQs not-invited-to or matched-against.** The vendor never sees a "you appeared in N searches but were invited to M" statistic that would reveal exclusion. A blacklisted vendor's analytics are **byte-equivalent** to a non-matched vendor's.

### §10.4 No buyer-private signal, ever
The vendor **never sees** any buyer's private CRM status, link suggestions, blacklist, exclusion reason, or comparison ranking. The buyer-private CRM (Doc-7F §8) and the private exclusion mechanism (`read_crm_status_for_routing`, internal-service) are **invisible** to the vendor by construction.

---

## §11 — Composition, Data, Authz, Baseline & Conformance

### §11.1 Composed embedded components (Doc-7B; `CHK-7-005`)
- **Trust badge** — the vendor's **own** trust/performance/verified-tier (`Doc-5G` own-org/User read, **read-only** — never mutates; score firewall).
- **Billing/quota indicator** (`Doc-5I`) — the vendor's plan/quota (e.g. ad capacity, lead/quotation allowance) — a billing-feature gate (QUOTA), never a matching firewall (Pass-1 §5.2).
- **AI advisory panel** (`Doc-5K`) — advisory only; **non-recommending** (R6/R10); binds confirmed Doc-5K User advisory reads or omit/`[ESC-7-API]`.
- **M6 thread** (`Doc-5H`) — RFQ/clarification thread with buyers; non-disclosure-bound.

### §11.2 Data, authz, baseline
- **Data** via the Doc-7C **server-side wired client**; reads (RSC) + writes (server actions + stable idempotency key); cursor pagination + POLICY `page_size`; error→state by `error_class`; browser holds no credential. **File uploads** (catalog images, spec documents, post-award attachments) carry the Doc-7C file-upload `[ESC-7-API]` — blobs to Storage, contract carries `file_ref` only.
- **Authz** UX gating on vendor slugs is **UX over server enforcement** (`Doc-7A §4.3`); read via contract, never name-string (Invariant #10).
- **Baseline** (Doc-7B §7): WCAG-AA, i18n-ready, **currency-per-field default BDT** on quotations/trade-invoices/finance (`Doc-2 §0.4`), responsive.

### §11.3 Applicable Appendix A (full surface)
| CHK | Status | Reason |
|---|---|---|
| `CHK-7-001/002/003/004` | **APPLIES** | reads + commands across profile/quotation/lead/ops |
| `CHK-7-005` | **APPLIES** | trust badge (own) / quota indicator / AI panel / thread |
| `CHK-7-010/011/012` | **APPLIES** | org-scoped (Vendor/Hybrid); UX gating; Hybrid mounts Vendor+Buyer |
| `CHK-7-020/021` | **APPLIES** | Content≠Presentation (microsite draft); display never re-ranks M3 |
| `CHK-7-030/031` | **APPLIES** | profile/quotation/ad/lead/engagement lifecycles |
| `CHK-7-040/041/042` | **APPLIES** | **byte-equivalence (load-bearing)**; quotation visibility; NOT_FOUND collapse |
| `CHK-7-050/051` | **APPLIES** | AI advisory non-authoritative, non-recommending |
| `CHK-7-060/061/062/063` | **APPLIES** | baseline; currency |
| `CHK-7-070/071` | **APPLIES** | out-of-frontend; doc generation System; media as `file_ref` |
| `CHK-7-080/081` | **APPLIES** | realize-never-redecide; engine never invoked |

### §11.4 Carried items & coins nothing
`DR-7-SHELL` · `DR-7-API` (Vendor-leg; `[ESC-7-API]` incl. file-upload grant) · `DR-7-STATE` · `claim_vendor_profile` carries `Doc-5D` DD-7. Binds frozen Vendor-leg by pointer; **never invokes the engine**; nothing coined (GR12).

---

## Appendix — View / Contract-Binding Skeleton *(names = presentation vocabulary; bound contracts frozen)*

| View | Bound frozen contract(s) | Notes |
|---|---|---|
| Profile / capacity / declared tier | BC-MKT-1 (Doc-5D) | capability matrix; declared≠verified |
| Microsite / profile-experience / custom-domains / showcase | BC-MKT-4 (Doc-5D §6) | draft projection; published in Doc-7D |
| Catalog / products / categories | BC-MKT-3/2 (Doc-5D) | versioned specs |
| Advertising | BC-MKT-5 (Doc-5D) | submit; Admin reviews |
| Invitation inbox & response | `respond_to_invitation` + reads (Doc-5E §5) | **received-only** (byte-equivalence) |
| Quotation authoring / versioning | `submit_/revise_/withdraw_quotation`/`request_late_extension` + reads (Doc-5E §5) | visibility-gated; versioned |
| Lead pipeline | `update_lead_stage`/`add_lead_activity` + reads (Doc-5F BC-OPS-3) | System-created leads; **received-only** |
| Post-award vendor-leg | `issue_trade_invoice`/challan/`record_delivery` + BC-OPS-4/5 (Doc-5F) | money = records (R8) |
| Embedded | own trust badge · quota indicator · AI panel (non-recommending) · M6 thread | composed from Doc-7B |

Exact pages/routes realized with the implementation; Doc-7G fixes the **view inventory + bindings**.

---

## Pass-2 self-check (pre-review)

- **Byte-equivalence (load-bearing):** §6.2/§8.3/§10.2/§10.3 — received-only; absence non-disclosed; **analytics denominator = submitted, never all-RFQs**; no buyer-private signal.
- **Bindings verified:** §6/§7 ↔ Doc-5E §5; §8 ↔ Doc-5F BC-OPS-3; §9 ↔ BC-OPS-2/4/5 vendor-leg.
- **Money-boundary:** §9.2 records not settlement; trade invoice ≠ platform billing.
- **Score firewall:** §11.1 — own trust read-only.
- **Coins nothing:** Appendix names presentation vocabulary; bound contracts frozen; engine never invoked.
- **Open for review:** confirm the quotation outcome (awarded/not-awarded) the vendor sees is non-competitive (no ranking — §7.3); confirm `list_leads` cannot leak an exclusion via a count.

*End of Content Pass-2 (§6–§11 + Appendix) — DRAFT. Realizes `Doc-7G_Structure_v1.0_FROZEN` §6–§11 + Appendix. Nothing coined; byte-equivalence attestation realized. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7G FROZEN.*
