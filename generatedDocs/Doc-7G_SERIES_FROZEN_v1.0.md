# Doc-7G — Vendor Workspace — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7G** — the Vendor Workspace; **carries the load-bearing byte-equivalence non-disclosure attestation (blacklist undetectable)** |
| Program | **Doc-7 — Frontend Realization** |
| Realizes | the **Vendor-leg** of frozen **Doc-5E** (§5) + **Doc-5D** (BC-MKT-1/2/3/4/5) + **Doc-5F** (BC-OPS-2/4/5 vendor-leg + BC-OPS-3 lead pipeline), on Doc-7C `(app)`, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (GR12) |
| Coins | **Nothing** — binds frozen Vendor-leg by pointer; vendor declares-not-verifies tier; carries the file-upload `[ESC-7-API]` |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7G_Structure_v1.0_FROZEN` (= Proposal v0.1 + Patch v0.1.1) |
| Content §0–§5 | `Doc-7G_Content_v1.0_Pass1` + `Doc-7G_Content_Pass1_Patch_v1.0.1` |
| Content §6–§11 + Appendix | `Doc-7G_Content_v1.0_Pass2` + `Doc-7G_Content_Pass2_Patch_v1.0.1` |
| Freeze gates | `Doc-7G_Structure_Freeze_Audit_v1.0` · `Doc-7G_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7G_Structure_Independent_Hard_Review_v0.1` · `Doc-7G_Content_Pass{1,2}_Independent_Hard_Review_v1.0` |

---

## What Doc-7G fixes (summary — authoritative text is the effective set)

**The load-bearing byte-equivalence attestation (Invariant #11):** a blacklisted/excluded vendor's experience is **byte-equivalent** to a non-matched vendor's across **inbox, lead pipeline, quotation outcomes, notifications, and analytics**. The vendor sees only **positive facts**; **absence is uniformly non-disclosed**. **Analytics guard (the highest-risk vector):** a win/conversion-rate denominator is **submitted quotations / received invitations, NEVER all-matchable RFQs**; no metric counts RFQs not-invited-to. The vendor **never sees** any buyer's private CRM/blacklist/link-suggestions/exclusion-reason or the comparison ranking.

**Bindings:** profile (BC-MKT-1; capability matrix Inv #1; **declared** tier — verified is M5 read-only) · microsite/profile-experience/custom-domains/showcase (BC-MKT-4 — vendor manages the **draft**; published renders in Doc-7D; no draft leak, R5) · catalog/products/categories (BC-MKT-3/2; versioned specs, Inv #8) · advertising (BC-MKT-5 — vendor submits, Admin reviews) · invitation inbox & response (Doc-5E §5; **received-only**) · quotation authoring/versioning (Doc-5E §5; visibility-gated, no competitive disclosure) · lead pipeline (Doc-5F BC-OPS-3; System-created leads; **received-only**) · post-award vendor-leg (Doc-5F BC-OPS-2/4/5 — **`issue_trade_invoice`/challan/`record_delivery`**; money = records, R8; buyer approval = Doc-7F).

**Firewalls:** score firewall (declares tier, reads own scores via Doc-5G, never mutates) · money-boundary R8 (records ≠ settlement; trade invoice ≠ platform billing) · quota = billing/delivery feature (three-instrument `Doc-3 §4.1.1`), never a matching gate (R7). State machines per Doc-4M; engine never invoked. **Composed:** own trust badge · quota indicator · AI panel (non-recommending) · M6 thread.

**Conformance:** full Appendix A applies; `CHK-7-040` is the load-bearing byte-equivalence carrier.

---

## Carried into Doc-7H

`DR-7-SHELL` · `DR-7-API` · `DR-7-STATE` · `[ESC-7-API]` (incl. file-upload grant) · `[ESC-7-POLICY]` · `[ESC-7-DESIGN]`. Resolved only via named channels.

**Next deliverable (the last surface):** **Doc-7H — Admin Console** — moderation, verification tasks, bans, category/vendor approval, **ad review** (`review_advertisement`), import, **routing control** (`assist_routing`/`manage_routing_rule`), config policy, **plan catalog** (`create_/update_/retire_/activate_plan` — incl. the `activate_plan` flagged from Doc-7E); realizes `Doc-5J` (Admin-only) + cross-module Admin reads; **no active-org**; Admin-decides / owning-module-owns.

*End of Doc-7G SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7G realizes the Vendor Workspace over the frozen Doc-5E/5D/5F Vendor surfaces; carries the load-bearing byte-equivalence attestation (blacklist undetectable, incl. analytics); vendor declares-not-verifies tier; handles no money; coins nothing.*
