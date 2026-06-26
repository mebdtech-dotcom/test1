# Doc-7G — Vendor Workspace — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **STRUCTURE FROZEN v1.0** (2026-06-26). Effective = `Doc-7G_Structure_Proposal_v0.1` + `Doc-7G_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-7 — Frontend Realization**; Doc-7G = the **Vendor Workspace** — **carries the load-bearing byte-equivalence non-disclosure attestation (blacklist undetectable)** |
| Realizes | the **Vendor-leg** of frozen **Doc-5E** (§5) + **Doc-5D** (BC-MKT-1/2/3/4/5) + **Doc-5F** (BC-OPS-2/4/5 vendor-leg + BC-OPS-3 lead pipeline), on Doc-7C `(app)`, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (GR12) |
| Coins | **Nothing** — binds frozen Vendor-leg by pointer; vendor only **declares** tier (M5 verifies) |

**Governing rule (byte-equivalence):** a blacklisted/excluded vendor's experience is **byte-equivalent** to a non-matched vendor's — no surface, view, count, **analytic**, notification, or error reveals exclusion/blacklist (Invariant #11). The vendor sees only positive facts; absence is uniformly non-disclosed. The vendor **declares** its financial tier (never the M5-verified value), mutates **no platform-wide score**, handles **no buyer↔vendor money** (R8). Coins nothing.

---

## Ratified decisions (GR1–GR12)
*(`GRn` = Doc-7G realization decisions — distinct from `DR-7-*`.)*

- **GR1 — Scope: the Vendor Workspace.** Profile & microsite management, catalog/products, ads, invitation inbox + response, quotation authoring/versioning, lead pipeline, post-award vendor-leg. Realizes the Vendor-leg of Doc-5E + Doc-5D + Doc-5F. Mounts `(app)`, org-scoped (Vendor/Hybrid). **Carries the load-bearing byte-equivalence attestation** (GR11).
- **GR2 — Vendor profile management (Doc-5D BC-MKT-1).** `create_vendor_profile`, `claim_vendor_profile` (carries `Doc-5D` DD-7, tracked), `update_vendor_profile`, `transfer_vendor_ownership`, `upsert_vendor_capacity_profile`, `set_declared_financial_tier` + reads. **Capability matrix** (4 flags `can_supply`/`can_service`/`can_fabricate`/`can_consult` — Invariant #1; a matrix, not a label). **Financial tier is DECLARED** by the vendor; the **M5-verified tier is read-only** (firewall).
- **GR3 — Microsite & presentation management (Doc-5D BC-MKT-4; Content≠Presentation; R5).** The vendor manages the **draft (controlling-org) projection**; the BC-MKT-4 presentation + `publish_*`/`unpublish_*` commands are bound at content (bind-or-ESC); `publish_*` drives draft→published (Doc-4M); **no draft leaks to the public surface** (`Doc-5D R5`); the **published projection renders in Doc-7D**. Vendor-branded theming (Doc-7B).
- **GR4 — Catalog & products (Doc-5D BC-MKT-3/2).** `create_product`/`update_product`/`set_product_status`/spec management + category assignment (`assign_/update_/remove_category_assignment`; categories Admin-governed — the vendor only assigns). Draft/published per R5.
- **GR5 — Advertising (Doc-5D BC-MKT-5 vendor leg).** `create_advertisement`/`submit_advertisement`/`set_advertisement_state` + reads. The vendor **submits**; **`review_advertisement` is Admin** (Doc-7H). Ad lifecycle per Doc-4M.
- **GR6 — Invitation inbox & response (Doc-5E §5 vendor).** `respond_to_invitation` (accept/decline) + invitation reads (`get_invitation`/`list_invitations` vendor leg). **The inbox shows ONLY invitations received** — no "you were excluded/not invited" signal (byte-equivalence — GR11).
- **GR7 — Quotation authoring & versioning (Doc-5E §5 vendor).** `submit_quotation`/`revise_quotation`/`withdraw_quotation`/`request_late_extension` + reads (`get_quotation`/`list_quotations_for_rfq`, **`quotation_visibility`-gated**). Quotation **versioning** (Invariant #8). State machine per Doc-4M.
- **GR8 — Lead pipeline (Doc-5F BC-OPS-3 vendor).** `update_lead_stage`/`add_lead_activity` + reads (`get_lead`/`list_leads`). **Leads are System-created on invitation** (`create_lead_on_invitation`, out-of-wire — R7); the vendor does not create leads. **The pipeline shows only received leads** — absence is non-disclosed (non-match OR private exclusion — undetectable; GR11).
- **GR9 — Post-award vendor-leg (Doc-5F BC-OPS-2/4/5 vendor; money-boundary R8).** **`issue_trade_invoice`** (the vendor bills the buyer), vendor-issued documents (delivery **challan**), **`record_delivery`**, vendor-side trade-invoice status, vendor templates (BC-OPS-4) + finance records (BC-OPS-5). **Buyer-side approval (`update_trade_invoice_status` buyer leg) is Doc-7F.** Money-boundary R8 — records, never settlement; trade invoice ≠ platform billing invoice. `generate_document` System async (out-of-wire) — triggered by a vendor command, read via the grant model.
- **GR10 — State-machine UI (Doc-4M).** Profile claim, microsite publish, ad, quotation, lead, engagement lifecycles render only Doc-4M-permitted Vendor transitions; System transitions (matching/routing/lead-creation/doc-generation) displayed, never invoked.
- **GR11 — Byte-equivalence non-disclosure (THE load-bearing attestation; Invariant #11; `CHK-7-040`).** A blacklisted/excluded vendor's experience is **byte-equivalent** to a non-matched vendor's: **no surface, view, count, analytic, notification, or error reveals** blacklist/exclusion. The vendor sees only **positive facts**; **absence (no invitation/lead) is uniformly non-disclosed**. **Vendor analytics/metrics expose only positive facts** — invitations received, quotations submitted, awards won on submitted; **a win/conversion-rate denominator is submitted quotations (or received invitations), NEVER all-matchable RFQs**; **no metric/count/chart/export includes a count of RFQs not-invited-to or matched-against**. The vendor **never sees** any buyer's private CRM status, link suggestions, blacklist, or exclusion reason. Reads own-org / `quotation_visibility`-gated; cross-tenant/protected → `NOT_FOUND`. **This attestation is the document's load-bearing freeze obligation.**
- **GR12 — Composition, firewall & applicable Appendix A.** Composes Doc-7B embedded components: **trust badge** (the vendor's **own** trust/performance/verified-tier — `Doc-5G` own-org/User read, **read-only**, never mutates — score firewall), **billing/quota indicator** (`Doc-5I` vendor plan/quota), **AI advisory panel** (`Doc-5K` — advisory only, non-recommending — R6/R10), **M6 thread** (RFQ/clarification with buyers). Full `CHK-7-xxx` set APPLIES; N/A reasons at content. Coins nothing; gaps → `[ESC-7-API]`.

---

## Section spine (authored in content passes)

§0 Control/Precedence/Gating · §1 Scope & the Vendor Workspace's Place (byte-equivalence load-bearing) · §2 Vendor Profile Management (GR2) · §3 Microsite & Presentation Management (GR3) · §4 Catalog & Products (GR4) · §5 Advertising (GR5) · §6 Invitation Inbox & Response (GR6) · §7 Quotation Authoring & Versioning (GR7) · §8 Lead Pipeline (GR8) · §9 Post-Award Vendor-Leg (GR9) · §10 State-Machine UI & Byte-Equivalence Non-Disclosure — the attestation (GR10/GR11) · §11 Composition, Data, Authz, Baseline & Conformance (GR12) · Appendix View/Contract-Binding Skeleton.

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

The kit/shell (Doc-7B/7C) · any other surface (Doc-7D/7E/7F/7H) · the **Buyer leg** (RFQ authoring, comparison, award, buyer-private CRM — Doc-7F) · **Admin** (`review_advertisement`, vendor approval — Doc-7H) · the **matching/routing engine** (System out-of-wire) · the **M5-verified financial tier / trust / performance scores** (vendor declares tier + reads scores; never mutates) · **revealing exclusion / blacklist / non-match** to the vendor — incl. via analytics denominators (the byte-equivalence violation — Inv #11) · the platform **handling buyer↔vendor money** (R8) · coining any contract/route-as-API/field/state/POLICY key · the e2e **test** obligation (Doc-8).

---

*End of Doc-7G Canonical Structure **v1.0 FROZEN**. Effective = Proposal v0.1 + Patch v0.1.1; Independent Hard Review + Structure Freeze Audit PASS. Doc-7G realizes the Vendor Workspace over the frozen Doc-5E/5D/5F Vendor surfaces; carries the load-bearing byte-equivalence attestation (blacklist undetectable, incl. analytics); vendor declares-not-verifies tier; handles no money; coins nothing. Next: Doc-7G content passes.*
