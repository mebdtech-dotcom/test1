# Doc-5D_VendorSlugResolve_Patch_v1.0.2.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-11) + FOLDED into the corpus.**
> This is the corpus copy `generatedDocs/Doc-5D_VendorSlugResolve_Patch_v1.0.2.md`, registered in
> `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`, carried **alongside** the unedited frozen Doc-5D
> (`Doc-5D_Structure_v1.0_FROZEN.md` + `Doc-5D_Content_v1.0_Pass1…3` + `Doc-5D_SERIES_FROZEN_v1.0.md`
> + `Doc-5D_PublicProductDetail_Patch_v1.0.1`) — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-5D_VendorSlugResolve_Additive_Patch_PROPOSAL.md`.
>
> **Linked-pair** with `Doc-4D_VendorSlugResolve_Patch_v1.0.4` (the contract this realizes) —
> approved and folded **together**.
>
> **Resolves** `[ESC-MKT-SLUG-RESOLVE]` (`esc_registry.md`) — same origin as the linked Doc-4D
> patch.

## Status

Approved Patch — FOLDED 2026-07-11 (human-approved: owner/Board ruling)

| Field | Value |
|---|---|
| Patch ID | **PATCH-5D-VSR-01** |
| Applies to | Doc-5D v1.0.1 (Structure FROZEN + Content Pass1…3 + SERIES freeze + `Doc-5D_PublicProductDetail_Patch_v1.0.1`) |
| Produces | Doc-5D **v1.0.2** (v1.0.1 + this patch) |
| Scope | **One item, nothing else:** wire realization of the new `marketplace.resolve_vendor_slug.v1` (linked Doc-4D patch). No other endpoint, projection, POLICY, or register is touched. |
| Purpose | Put the slug-resolution read on the wire so the public vendor microsite route (`app/(public)/vendors/[slug]/`) can call it before calling `get_public_vendor_profile.v1`. |
| Raised by | `[ESC-MKT-SLUG-RESOLVE]` (`esc_registry.md`) — same origin as the linked Doc-4D patch. |
| Authority | CLAUDE.md §7/§8/§11/§13; Doc-5A §5.2/§5.3/§5.5/§5.7 (wire grammar/templates), §6.2 (error envelope), §6.3/§7 (non-disclosure/actor carriage); Doc-4A §18.2/§19; Doc-5D Structure R1–R10; Doc-4D §D6 (+ linked patch v1.0.4) |

All frozen Doc-5D decisions — R1 out-of-wire boundary, R2 tri-actor, R3 route prefix, R4
anti-invention, R5 projection separation, R9 non-disclosure firewall — are **preserved and bound
by pointer.**

---

# PATCH-5D-VSR-01 — Wire realization of `marketplace.resolve_vendor_slug.v1`

**Location:** Doc-5D §8 — *Discovery & Public Read Surface Realization (BC-MKT-6)* — appended to
the §8.1 endpoint set and the §2.5 inventory (new row 66, following row 65
`get_public_product_detail`). Composition precedent: `get_public_vendor_profile.v1` (Pass1 row
64) and `get_public_product_detail.v1` (row 65) — same public-surface shape.

## 1.1 Inventory row (appended to §2.5; Doc-5A §5.7 wire modeling)

| # | Doc-4D Contract-ID | Actor | Method · Path | Active-Org | Success | § |
|---|---|---|---|---|---|---|
| 66 | `marketplace.resolve_vendor_slug.v1` | Public | `GET /marketplace/vendor_slug_resolutions/{slug}` *(anonymous; identifier resolution only; non-disclosure — Invariant #11)* | N (public) | `200` | §8 |

- **Path grammar (Doc-5A §5.3):** `/{module-namespace}/{resource-plural}/{id}` — `marketplace` (R3
  reserved prefix) · `vendor_slug_resolutions` (snake_case resource-plural naming the *operation's
  result*, not `vendor_profiles`, since this endpoint does not return a vendor profile — it
  resolves an identifier; mirrors the naming discipline `get_public_product_detail` used for
  `public_product_details` rather than reusing `products`) · `{slug}` = the slug string itself (not
  a UUID — the one path segment in this inventory that isn't an id, because the entire purpose of
  this endpoint is to accept the thing that isn't yet an id).
- **API path ≠ page URL (anti-conflation note, same posture as row 65):** the public **page** URL
  (`/vendors/{slug}`) is presentation routing owned by the FE, not this API path. This wire path is
  the **API** surface only.
- **Carriage (R2 public surface):** no `Authorization`, no `Iv-Active-Organization` — anonymous,
  identical response for every caller class.

## 1.2 Response realization (Doc-5A §5.5; Doc-5D §4.7 top-level `reference_id`)

`200` → `{ result: <one of the three shapes below>, reference_id }`. Single-lookup read — no
pagination.

| `status` | Wire content | When |
|---|---|---|
| `current` | `vendor_profile_id` (uuid) | `slug` matches a live, currently-visible `vendor_profiles` row |
| `migrated` | `current_slug` (string) | `slug` matches `vendor_slug_history.old_slug` **and** the migration target is currently visible |
| `not_found` | *(no additional fields)* | neither of the above, **or** a history match whose target is no longer visible |

**Exclusions are binding** (Doc-4D v1.0.4 §PATCH-4D-VSR-01, by pointer): no vendor name,
capability, geography, or any other profile field on any branch. No `human_ref` on the `current`
branch.

## 1.3 Non-disclosure & errors (Invariant #11; Doc-5A §6.2/§6.3)

- **Uniform collapse — the two-hop case is the one that must be tested, not assumed:** absent slug,
  a live-but-invisible (unpublished/banned/soft-deleted) vendor's current slug, **and** a retired
  slug whose migration target is no longer visible, all produce the **same** `{ status: 'not_found'
  }` — byte-identical status, body, and timing across all three causes and every cache tier.
- Malformed `slug` (fails the Doc-6D VSS 6D-VSS-01.1 format law) → `marketplace_vendor_slug_invalid_input`
  (VALIDATION); statuses per Doc-5A §6.2 by pointer.
- Top-level `reference_id` on every body-bearing response (§4.7).
- **Reads are not audited** (Doc-4A §17.1); no event emitted; idempotency not-applicable.

## 1.4 Rate limiting (Doc-4A §19; §18.2 gate)

Throughput-type control; `RATE_LIMITED` (retryable true). Bound to the **already-registered**
POLICY identifier `marketplace.public_read_rate_limit`
(`Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit`) — **no new POLICY key
registered by this patch.**

---

# PATCH-5D-VSR-01 · Part 2 — Conformance rows carried for Doc-8 (wired at fold time)

| # | Check |
|---|---|
| V-1 | **Uniform not-found across all three causes** — absent slug, invisible-vendor live slug, and migrated-but-now-invisible-target — byte-identical status/body/timing, including every cache tier |
| V-2 | **Migrated-slug redirect only to a currently-visible target** — a `vendor_slug_history` match whose target vendor is banned/unpublished/soft-deleted at read time returns `not_found`, never `migrated` |
| V-3 | **`current` branch never returns profile fields** — response shape contains only `vendor_profile_id` |
| V-4 | **Case-sensitivity**: a request `slug` containing any uppercase character never matches a stored (always-lowercase) slug — falls through to `not_found` |
| V-5 | **Rate-limit adoption**: requests beyond the configured `marketplace.public_read_rate_limit` threshold receive `RATE_LIMITED`, consistent with row 65's realization |

---

# Explicit NOT-changes

No new endpoint beyond row 66 · no change to any other inventory row or §4–§9 section · R1–R10
intact · no interaction with `vendor_slug_history`'s write path (still System/service-role only,
per `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1` 6D-VSS-01.3) · no change to
`get_public_vendor_profile.v1`'s own wire realization (row 64, unchanged) · no matching/ranking/
discovery-ordering surface created.

# Downstream resolution — landed together at this fold

- **`Doc-4D_VendorSlugResolve_Patch_v1.0.4` (linked pair):** the contract this patch realizes.
  **Folded together with this patch.**
- **`[ESC-MKT-SLUG-RESOLVE]`:** resolved by this pair — registry pointer updated at fold time.
- **`W3-MKT-1`:** the M2 pilot-slice WP card builds against this contract.

---

*End of Doc-5D_VendorSlugResolve_Patch_v1.0.2 — realizes `marketplace.resolve_vendor_slug.v1` on
`GET /marketplace/vendor_slug_resolutions/{slug}` with the uniform not-found collapse covering all
three non-visible causes, including the two-hop migrated-then-hidden case (V-1/V-2); no new POLICY
key; adopts `marketplace.public_read_rate_limit`. Linked-pair with
Doc-4D_VendorSlugResolve_Patch_v1.0.4 — approved and folded together. Status: APPROVED — FOLDED
2026-07-11 (owner ruling).*
