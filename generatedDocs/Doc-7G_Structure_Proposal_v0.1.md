# Doc-7G — Vendor Workspace — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-7G artifact. Next: Independent Hard Review (Board) → Structure Patch → short closure check → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Program | **Doc-7 — Frontend Realization**; Doc-7G = the **Vendor Workspace** — vendor profile & microsite management, invitation inbox, quotation authoring/versioning, catalog, ads, lead pipeline, post-award vendor-leg. **Carries the load-bearing byte-equivalence non-disclosure attestation (blacklist undetectable).** |
| Realizes | the **Vendor-leg** of frozen **Doc-5E** (invitation response §5 · quotation authoring §5 · reads) + **Doc-5D** (vendor profile/microsite/catalog/ads — BC-MKT-1/2/3/4/5, draft projection) + **Doc-5F** (vendor-leg BC-OPS-2/4/5 + lead pipeline BC-OPS-3), on Doc-7C `(app)`, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (GR12) |
| Authority | Conforms to `Doc-7A`/`7B`/`7C` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5E/5D/5F Vendor surfaces |
| Coins | **Nothing** — binds frozen Vendor-leg by pointer; the vendor only **declares** financial tier (M5 verifies); view/route names are presentation vocabulary |

**Governing rule (the byte-equivalence attestation):** a blacklisted/excluded vendor's experience is **byte-equivalent** to a non-matched vendor's — **no surface reveals exclusion or blacklist** (Invariant #11). The vendor sees only **positive facts** (invitations/leads received, quotations submitted); **absence of an invitation/lead is non-disclosed**. The vendor **declares** its financial tier (never the M5-verified value), mutates **no platform-wide score**, and **handles no buyer↔vendor money** (R8). Coins nothing.

---

## Decisions proposed for ratification (R-set `GR1…GR12`)
*(`GRn` = Doc-7G realization decisions — distinct from `DR-7-*`.)*

- **GR1 — Scope: the Vendor Workspace.** The authenticated vendor's surface: profile & microsite management, catalog/products, ads, invitation inbox + response, quotation authoring/versioning, lead pipeline, post-award vendor-leg. Realizes the Vendor-leg of Doc-5E + Doc-5D + Doc-5F. Mounts `(app)`, **org-scoped** (Vendor/Hybrid participation); consumes the 7B kit + 7C client by reference. **Carries the load-bearing byte-equivalence attestation** (GR11).
- **GR2 — Vendor profile management (Doc-5D BC-MKT-1).** Bind `create_vendor_profile`, `claim_vendor_profile`, `update_vendor_profile`, `transfer_vendor_ownership`, `upsert_vendor_capacity_profile`, `set_declared_financial_tier` + reads (`get_vendor_profile`/`get_vendor_capacity_profile`/`get_declared_financial_tier`/`get_financial_tier_history`). The **capability matrix** (4 flags `can_supply`/`can_service`/`can_fabricate`/`can_consult` — Invariant #1) is a matrix, not a label. **Financial tier is DECLARED** by the vendor (`set_declared_financial_tier`); the **M5-verified tier is read-only** (the vendor never sets the verified value — governance firewall). Claim lifecycle + visibility scope.
- **GR3 — Microsite & presentation management (Doc-5D BC-MKT-4; Content≠Presentation; `Doc-5D R5`).** The vendor manages the **draft (controlling-org) projection** of its microsite/presentation; the **published projection renders publicly (Doc-7D)**. `publish_*`/`unpublish_*` drive the transition (Doc-4M); **no draft leaks to the public surface** (`Doc-5D R5`). Two surfaces, one owner (Doc-7A §6.2). Vendor-branded theming (Doc-7B microsite theme override).
- **GR4 — Catalog & products (Doc-5D BC-MKT-3/2).** Bind `create_product`/`update_product`/`set_product_status`/spec management (`link_product_spec`/`add_spec_document`/etc.) + category assignment (`assign_category`/`update_category_assignment`/`remove_category_assignment` — BC-MKT-2; categories are Admin-governed, the vendor only assigns). Draft/published per R5.
- **GR5 — Advertising (Doc-5D BC-MKT-5 vendor leg).** Bind `create_advertisement`/`submit_advertisement`/`set_advertisement_state` (User leg) + reads (`get_advertisement`/`list_advertisements`). The vendor **submits**; **`review_advertisement` is Admin** (Doc-7H) — not here. Ad lifecycle per Doc-4M.
- **GR6 — Invitation inbox & response (Doc-5E §5 vendor).** Bind `respond_to_invitation` (accept/decline) + invitation reads (`get_invitation`/`list_invitations` vendor leg). **The inbox shows ONLY invitations received** — there is **no "you were excluded / not invited" signal** (byte-equivalence — GR11). The vendor never sees the routing decision that did/didn't invite it.
- **GR7 — Quotation authoring & versioning (Doc-5E §5 vendor).** Bind `submit_quotation`, `revise_quotation`, `withdraw_quotation`, `request_late_extension` + reads (`get_quotation`/`list_quotations_for_rfq` vendor leg, **`quotation_visibility`-gated**). Quotation **versioning** (Invariant #8 — revisions are new versions, prior never overwritten). State machine per Doc-4M.
- **GR8 — Lead pipeline (Doc-5F BC-OPS-3 vendor).** Bind `update_lead_stage`, `add_lead_activity` + reads (`get_lead`/`list_leads`). **Leads are created by the System** on invitation (`create_lead_on_invitation`, §9 out-of-wire — `Doc-5F R7`); the vendor does not create leads (a lead = an RFQ invitation). **The pipeline shows only received leads** — **absence of a lead is non-disclosed** (non-match OR private exclusion — undetectable; GR11).
- **GR9 — Post-award vendor-leg (Doc-5F BC-OPS-2/4/5 vendor; money-boundary R8).** Bind the **vendor-leg**: **`issue_trade_invoice`** (the vendor bills the buyer), vendor-issued documents (delivery **challan**), **`record_delivery`**, vendor templates (BC-OPS-4) + finance records (BC-OPS-5). **Money-boundary R8** — records/workflow, never settlement/escrow; a trade invoice is an operations record (≠ platform billing invoice). `generate_document` is System async (out-of-wire) — triggered by a vendor command, read via the grant model.
- **GR10 — State-machine UI (Doc-4M).** Profile claim, microsite publish, ad, quotation, lead, engagement lifecycles render only Doc-4M-permitted Vendor transitions; System transitions (matching/routing/lead-creation/doc-generation) displayed, never invoked.
- **GR11 — Byte-equivalence non-disclosure (THE load-bearing attestation; Invariant #11; `CHK-7-040`).** A blacklisted/excluded vendor's experience is **byte-equivalent** to a non-matched vendor's: **no surface, view, count, analytic, notification, or error reveals** that the vendor was blacklisted by a buyer or excluded from routing. The vendor sees only **positive facts**; **absence (no invitation/lead) is uniformly non-disclosed** — never attributable to exclusion. The vendor **never sees** any buyer's private CRM status, link suggestions, blacklist, or exclusion reason. Reads are **own-org / `quotation_visibility`-gated**; cross-tenant/protected → `NOT_FOUND` (`Doc-5A §6.3`). **This attestation is the document's load-bearing freeze obligation.**
- **GR12 — Composition, firewall & applicable Appendix A.** Composes Doc-7B embedded components: **trust badge** (the vendor's **own** trust/performance, `Doc-5G` read — read-only; the vendor never edits its score), **billing/quota indicator** (`Doc-5I` vendor plan/quota), **AI advisory panel** (`Doc-5K` — advisory only, non-recommending, R6/R10), **M6 thread** (RFQ/clarification with buyers). Full `CHK-7-xxx` set APPLIES; N/A reasons at content. **Score firewall:** the vendor reads its trust/performance/verified-tier, **never mutates them** (M5; auto-calculated under System). Coins nothing; gaps → `[ESC-7-API]`.

---

## The Doc-7G section spine (authored in content passes)

| § | Title | Realizes |
|---|---|---|
| §0 | Document Control, Precedence & Gating | governance §3; Doc-7A §0 |
| §1 | Scope & the Vendor Workspace's Place (byte-equivalence load-bearing) | GR1/GR11 |
| §2 | Vendor Profile Management (capability matrix; declared tier) | GR2; Doc-5D BC-MKT-1 |
| §3 | Microsite & Presentation Management (draft projection) | GR3; Doc-5D BC-MKT-4; R5 |
| §4 | Catalog & Products | GR4; Doc-5D BC-MKT-3/2 |
| §5 | Advertising | GR5; Doc-5D BC-MKT-5 |
| §6 | Invitation Inbox & Response (byte-equivalence) | GR6; Doc-5E §5 |
| §7 | Quotation Authoring & Versioning | GR7; Doc-5E §5 |
| §8 | Lead Pipeline (byte-equivalence) | GR8; Doc-5F BC-OPS-3 |
| §9 | Post-Award Vendor-Leg (money-boundary) | GR9; Doc-5F BC-OPS-2/4/5; R8 |
| §10 | State-Machine UI & Byte-Equivalence Non-Disclosure (the attestation) | GR10/GR11; Doc-4M; Inv #11 |
| §11 | Composition, Data, Authz, Baseline & Conformance | GR12 |
| Appendix | View / Contract-Binding Skeleton | GR2–GR9 |

*Doc-7G authors no kit/shell, no other surface, no buyer-leg, no admin surface, and never the matching/routing engine. Actual pages realized in content passes.*

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7G handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Consumes frozen Doc-7B kit + Doc-7C `(app)` shell | By reference | No |
| **DR-7-API** | Views bind frozen Doc-5E/5D/5F Vendor-leg | Consistency cross-check; `[ESC-7-API]` on a gap | Possible |
| **DR-7-STATE** | Profile/quotation/ad/lead/engagement UI per Doc-4M | Bound by pointer (GR10) | No |
| `[ESC-7-API]` | A view needs a non-existent/wrong-actor contract (incl. file-upload grant) | Flag-and-halt; additive Doc-5x patch (Board) | Possible |
| `[ESC-7-DESIGN]` | A composed embedded component needs allocation | Doc-7B definer | Possible |

## Fences / out of scope

The kit/shell (Doc-7B/7C) · any other surface (Doc-7D/7E/7F/7H) · the **Buyer leg** (RFQ authoring, comparison, award, buyer-private CRM — Doc-7F) · **Admin** (`review_advertisement`, vendor approval — Doc-7H) · the **matching/routing engine** (System out-of-wire) · the **M5-verified financial tier / trust / performance scores** (the vendor only **declares** tier and **reads** scores — never mutates; auto-calculated under System) · **revealing exclusion / blacklist / non-match** to the vendor (the byte-equivalence violation — Inv #11) · the platform **handling buyer↔vendor money** (R8) · coining any contract/route-as-API/field/state/POLICY key · the e2e **test** obligation (Doc-8).

---

## Provenance & next steps

- **Provenance:** grounded in `Doc-5E §5` (Vendor invitation-response + quotation authoring, visibility-gated) + `Doc-5D` BC-MKT-1/2/3/4/5 (vendor profile/microsite/catalog/ads; draft projection R5) + `Doc-5F` BC-OPS-2/3/4/5 (vendor-leg + lead pipeline; R7 seam; R8 money) + `Doc-7A/7B/7C` (frozen) + Invariant #1 (capability matrix), #8 (versioning), #11 (private exclusion). No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. R-set `GR1…GR12`; section spine §0–§11 + skeleton.
- **Next (Board-directed loop):** Independent Hard Review → Structure Patch → short closure check → Structure Freeze Audit → `Doc-7G_Structure_v1.0_FROZEN` → Doc-7G content passes → then Doc-7H (Admin) — the last surface.

*End of Doc-7G Canonical Structure **Proposal v0.1** — structure only. On any conflict, Doc-7A/7B/7C + the frozen corpus win; flag-and-halt. Doc-7G realizes the Vendor Workspace over the frozen Doc-5E/5D/5F Vendor surfaces; carries the load-bearing byte-equivalence attestation (blacklist undetectable); vendor declares-not-verifies tier; handles no money; coins nothing. Next: Independent Hard Review.*
