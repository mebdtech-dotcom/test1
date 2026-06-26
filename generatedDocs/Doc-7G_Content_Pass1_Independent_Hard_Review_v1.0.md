# Doc-7G — Content Pass-1 (§0–§5) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7G_Content_v1.0_Pass1.md` (§0–§5) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5D projection + bind-completeness conformance |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- §2 BC-MKT-1 vendor profile (`create_/claim_/update_/transfer_vendor_ownership`, capacity, declared tier) — verified `Doc-5D` line 40/42. CORRECT.
- §2.2 capability matrix (4 flags, Invariant #1); §2.3 declared ≠ verified (score firewall) — CORRECT.
- §4 catalog/products/specs (versioned `supersede_spec_document` — Inv #8); §5 ad submit / Admin reviews — CORRECT.

0 BLOCKER, 0 MAJOR. Three bind-completeness/projection refinements + one nit.

### MINOR-1 — §3 under-binds the microsite surface; bind the full verified BC-MKT-4 set
§3 defers to "publish_* bind-or-ESC," but the BC-MKT-4 surface is **verified and richer** (`Doc-5D_Content_v1.0_Pass2` §6). This is the content pass — bind it now, don't re-defer.
**Required fix:** §3 bind the verified BC-MKT-4 vendor commands:
- **Microsites:** `create_microsite`, `update_microsite`, `publish_microsite`/`unpublish_microsite`/`set_microsite_domain`.
- **Profile experience (the Content≠Presentation core — R5):** `update_profile_sections`/`update_branding_assets`/`update_seo_settings`, `publish_profile`/`unpublish_profile` (driving the literal draft↔published transition — Doc-4M).
- **Custom domains (entitlement-gated — DD-5/R8):** `create_custom_domain`, `activate_custom_domain`/`release_custom_domain`; **`confirm_custom_domain_verification` is System out-of-wire** (the UI never calls it — between create and activate).
- **Showcase:** `create_showcase_project`, `update_showcase_project`, `publish_showcase_project`.
- Reads: `get_microsite`/`get_profile_experience`/`get_showcase_project`/`get_custom_domain`.

### MINOR-2 — §2.3 verified-tier read + capacity projection
**Verified `Doc-5D` §5.7 (Pass2 line 39):** `get_vendor_capacity_profile` / `get_declared_financial_tier` / `get_financial_tier_history` are **Controlling-Org** (private — capacity is a matching input, never public). The **verified** tier is M5's (`Doc-5G`).
**Required fix:** §2 state — the vendor reads its **declared** tier via `get_declared_financial_tier` (Doc-5D, Controlling-Org) and its **verified** tier via `Doc-5G` (`get_verified_tier`, read-only); **capacity profile is Controlling-Org (private — a matching input, never on a public read)** (`Doc-5D R5`).

### MINOR-3 — §5.2 ad-capacity entitlement is a billing-feature gate, not the procurement firewall
§5.2 says "entitlement gates ad capacity." Clarify this is a **billing-feature entitlement** (the plan's ad allowance → `QUOTA` 403 on exceed), **distinct** from the **procurement/matching firewall** (`Doc-5I R5` — billing never gates trust/eligibility/routing/matching). Ad capacity is a legitimate billing feature, not a matching gate.
**Required fix:** §5.2 distinguish the ad-capacity **billing entitlement** (QUOTA) from the procurement firewall; billing never influences matching (R5/R7).

### NITPICK-1 — §2.1 `transfer_vendor_ownership` ≠ `transfer_ownership`
`transfer_vendor_ownership` (Doc-5D BC-MKT-1, **vendor-profile** ownership) is distinct from `transfer_ownership` (Doc-5C §C5, **organization** ownership — Doc-7E).
**Required fix:** note the distinction (profile ownership here; org ownership in Doc-7E).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 bind full BC-MKT-4 surface | MINOR | Content Patch — bind verified commands |
| MINOR-2 verified-tier read + capacity projection | MINOR | Content Patch — bind Doc-5G + note Controlling-Org |
| MINOR-3 ad-capacity = billing gate not firewall | MINOR | Content Patch — distinguish |
| NITPICK-1 transfer ownership distinction | NIT | Content Patch — note |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR. 3 MINOR open → **Content Patch required**, then short closure check, then Content Pass-2 (§6–§11 + Appendix).

*End of Content Pass-1 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — bindings sound; the microsite surface is now fully bound (BC-MKT-4 verified), and capacity/tier projections are pinned (Controlling-Org private).*
