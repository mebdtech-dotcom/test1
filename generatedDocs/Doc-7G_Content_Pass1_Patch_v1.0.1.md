# Doc-7G — Content Pass-1 **Patch v1.0.1** (applies Pass-1 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7G_Content_v1.0_Pass1.md` (§0–§5) |
| Applies | `Doc-7G_Content_Pass1_Independent_Hard_Review_v1.0.md` (3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-1 **+ this patch** = clean §0–§5 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-2 (§6–§11 + Appendix) |
| Discipline | Additive; nothing coined; bindings verified against the frozen surface |

---

## Changes

### C-1 — closes **MINOR-1** (bind full BC-MKT-4 surface)
**Verified `Doc-5D_Content_v1.0_Pass2` §6.** §3 binds the full BC-MKT-4 vendor surface:
- **Microsites:** `create_microsite`, `update_microsite`, `publish_microsite`/`unpublish_microsite`/`set_microsite_domain`.
- **Profile experience (Content≠Presentation core — R5):** `update_profile_sections`/`update_branding_assets`/`update_seo_settings`, `publish_profile`/`unpublish_profile` (drive the literal draft↔published transition — Doc-4M).
- **Custom domains (entitlement-gated — DD-5/R8):** `create_custom_domain`, `activate_custom_domain`/`release_custom_domain`; **`confirm_custom_domain_verification` is System out-of-wire** — the UI never calls it (between create and activate).
- **Showcase:** `create_showcase_project`, `update_showcase_project`, `publish_showcase_project`.
- Reads: `get_microsite`/`get_profile_experience`/`get_showcase_project`/`get_custom_domain`.

No `[ESC]` — the surface is fully bound.

### C-2 — closes **MINOR-2** (verified-tier read + capacity projection)
§2 amended: the vendor reads its **declared** tier via `get_declared_financial_tier` (Doc-5D, **Controlling-Org**) and its **verified** tier via `Doc-5G` (`get_verified_tier`, read-only — never mutated). **Capacity profile (`get_vendor_capacity_profile`) is Controlling-Org (private — a matching input, NEVER on a public read)** (`Doc-5D R5` / Pass2 §5.7); `get_financial_tier_history` is Controlling-Org (own-org version chain).

### C-3 — closes **MINOR-3** (ad-capacity billing gate vs firewall)
§5.2 amended: ad capacity is a **billing-feature entitlement** (the plan's ad allowance → `QUOTA` 403 on exceed) — **distinct from the procurement/matching firewall** (`Doc-5I R5` — billing never gates trust/eligibility/routing/matching). The quota indicator (§11) shows the ad allowance; billing never influences matching (R5/R7).

### C-4 — closes **NITPICK-1** (transfer ownership distinction)
§2.1 note: **`transfer_vendor_ownership`** (Doc-5D BC-MKT-1) transfers **vendor-profile** ownership; the **organization** ownership transfer (`transfer_ownership`, Doc-5C §C5) is **Doc-7E**. Distinct.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MINOR-1 BC-MKT-4 full bind | MINOR | C-1: microsites/profile-exp/custom-domains/showcase bound (verified Doc-5D §6); custom-domain verify = System | **CLOSED** — no re-defer |
| MINOR-2 verified-tier + capacity | MINOR | C-2: declared (Doc-5D CO) + verified (Doc-5G); capacity private | **CLOSED** |
| MINOR-3 ad-capacity billing gate | MINOR | C-3: QUOTA billing feature ≠ matching firewall | **CLOSED** |
| NITPICK-1 transfer distinction | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** The microsite surface is fully bound (verified BC-MKT-4); capacity/tier projections pinned (Controlling-Org private; verified via Doc-5G). Nothing coined.

**Next pass:** Content Pass-2 (§6–§11 + Appendix) — invitation inbox & response (§6), quotation authoring/versioning (§7), lead pipeline (§8), post-award vendor-leg (§9), state-machine & **byte-equivalence non-disclosure attestation** (§10), composition/data/conformance (§11), skeleton (Appendix).

*End of Content Pass-1 Patch v1.0.1 + Short Closure Check. Effective §0–§5 = Pass-1 + this patch. Additive; nothing coined; bindings verified.*
