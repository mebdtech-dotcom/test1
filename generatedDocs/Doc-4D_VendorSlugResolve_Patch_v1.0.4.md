# Doc-4D_VendorSlugResolve_Patch_v1.0.4.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-11) + FOLDED into the corpus.**
> This is the corpus copy `generatedDocs/Doc-4D_VendorSlugResolve_Patch_v1.0.4.md`, registered in
> `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`, carried **alongside** the unedited frozen Doc-4D
> content passes (v1.0 + `Doc-4D_CanonicalHost_Patch_v1.0.2` + `Doc-4D_PublicProductDetail_Patch_v1.0.3`)
> — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-4D_VendorSlugResolve_Additive_Patch_PROPOSAL.md`.
>
> **Linked-pair** with `Doc-5D_VendorSlugResolve_Patch_v1.0.2` (wire realization) — the two patches
> are approved and folded **together**, mirroring the Doc-4D v1.0.3 ↔ Doc-5D v1.0.1
> (PublicProductDetail) linked-pair precedent.
>
> **Resolves** `[ESC-MKT-SLUG-RESOLVE]` (`esc_registry.md`) — raised and resolved same-session,
> 2026-07-11, during Wave-3 M2 pilot-slice scoping: the frozen `get_public_vendor_profile.v1`
> request contract has no slug lookup mode, but the already-shipped public FE route
> (`app/(public)/vendors/[slug]/`) is keyed on the kebab-case marketing `slug` realized by
> `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1` (ADR-024). This patch supplies the missing
> slug→id resolution step without reshaping the existing frozen contract.

## Status

Approved Patch — FOLDED 2026-07-11 (human-approved: owner/Board ruling)

| Field | Value |
|---|---|
| Patch ID | **PATCH-4D-VSR-01** |
| Applies to | Doc-4D v1.0.3 (`Doc-4D_Structure_v1.0_FROZEN.md` + Content passes + `Doc-4D_CanonicalHost_Patch_v1.0.2` + `Doc-4D_PublicProductDetail_Patch_v1.0.3`) |
| Produces | Doc-4D **v1.0.4** (v1.0.3 + this patch) |
| Scope | **One additive Public query contract** — `marketplace.resolve_vendor_slug.v1` — appended to **BC-MKT-6 Discovery & Read-Model** (Doc-4D §D6), beside `get_public_vendor_profile`. **Nothing else.** No entity change, no ownership change, no schema change (realizes only already-frozen `vendor_profiles.slug` + `vendor_slug_history`, both from `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1`), no event, no state-machine change, no permission slug, no audit action. POLICY: adopts the existing registered `marketplace.public_read_rate_limit` (no new key). |
| Purpose | Give the public vendor microsite route (`app/(public)/vendors/[slug]/`, P-PUB-13) the missing slug→id resolution step, so `get_public_vendor_profile.v1` can be called with the identifiers it actually accepts. |
| Raised by | `[ESC-MKT-SLUG-RESOLVE]` (`esc_registry.md`) — found during Wave-3 M2 pilot-slice scoping, 2026-07-11; resolved same-session. |
| Authority | CLAUDE.md §7 (Doc-4D = rank 0 module contract), §8 (architecture-affecting → **human approval**), §11 (additive only, Realize-never-redecide), §13; Doc-4A §21.3 (Query template), §12 (error model), §19 (rate limiting), §18.2 (POLICY gate); Doc-4D §D6 (BC-MKT-6 home); `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1` (the `slug` + `vendor_slug_history` structures this contract exposes); CLAUDE.md Invariant #11 (blacklist undetectable — the binding rule that decides the non-disclosure gate below) |

All frozen Doc-4D decisions — the tri-actor model, BC partitions, DD-1…DD-8 dispositions, the
R-register, the `[ESC-MKT-AUDIT]` carried gap — are **preserved**. This patch is a minimal
additive exception routed through change management (human approval), following the same pattern
as `Doc-4D_CanonicalHost_Patch_v1.0.2` and `Doc-4D_PublicProductDetail_Patch_v1.0.3`: a new read
shape gets a **new, separate contract**, not a reshape of an existing frozen one. Reshaping
`get_public_vendor_profile.v1` itself to accept a slug parameter was the rejected alternative
(coining a new field on a frozen contract, and risking `slug` becoming a second, ambiguous public
identifier alongside `vendor_profile_id`/`human_ref`).

---

# PATCH-4D-VSR-01 — New contract `marketplace.resolve_vendor_slug.v1`

**Location:** Doc-4D §D6 — **BC-MKT-6 Discovery & Read-Model**, appended to the public read surface
beside `search_catalog` / `list_vendor_directory` / `get_public_vendor_profile` /
`get_public_product_detail`.

**Template:** Doc-4A **§21.3 Query**; naming per Doc-4A **§3.2** (imperative verb + owned entity —
no new verb coined; `resolve` + `vendor_slug` names what the contract does — translate a
presentation identifier to a canonical one — distinctly from `get` (fetch an entity), avoiding any
suggestion that a slug is itself a canonical identifier).

## Contract declaration

- **Contract-ID:** `marketplace.resolve_vendor_slug.v1` · **Kind:** 21.3 Query · **Owner:** M2
  (BC-MKT-6)
- **Purpose:** given the `slug` URL segment of the public vendor microsite route, resolve it to
  either a live vendor's `vendor_profile_id` (render), a current slug to redirect to (a retired
  slug was migrated — Doc-6D VSS), or nothing (uniform not-found). Realizes no new data — it is a
  read operation over two structures **already frozen** by `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1`:
  `vendor_profiles.slug` (live, unique-when-live) and `vendor_slug_history` (retired mappings,
  already public-readable "to serve public 301 resolution" per its own RLS comment, 6D-VSS-01.3).
- **Actor:** **public** — same single-Public-projection label as `get_public_vendor_profile`
  (Doc-4D PassB Discovery read block: "Actor: public"). Anonymous (R2): no `Authorization`, no
  `Iv-Active-Organization`.
- **Authorization (§B.9):** none required (public read). No permission slug bound — coining none
  (Doc-4A §6.4 anti-invention).
- **Scope guard (binding on this contract and every contract after it):** `slug` is accepted
  **only** by this contract. `get_public_vendor_profile.v1` and every other Marketplace contract,
  present and future, continue to accept only `vendor_profile_id`/`human_ref` — this patch does
  **not** make `slug` a general-purpose identifier, and no other contract gains a slug parameter as
  a side effect of this fold.
- **Request Contract:** `slug : string : required`. SYNTAX-validated against the existing format
  law realized by `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1` 6D-VSS-01.1
  (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, 3–40 chars, no `xn--` prefix) — reused, not re-defined.
  Matching against the stored column is exact-string; the format law permits lowercase only, so
  every validly-stored slug is already lowercase by construction — no case-normalization is
  introduced.
- **Response Contract (§B.3):** `{ result } + reference_id` — one of three shapes:
  - `{ status: 'current', vendor_profile_id: uuid }` — a live, visible match.
  - `{ status: 'migrated', current_slug: string }` — found in `vendor_slug_history.old_slug`
    **and** the migration target vendor is currently published/active/non-banned.
  - `{ status: 'not_found' }` — neither of the above, **or** a history match whose target vendor
    is no longer visible (see Non-Disclosure).
  - **Identifier resolution only:** this contract never returns vendor metadata (name, capability,
    geography, etc.) — only enough to redirect or to chain into `get_public_vendor_profile.v1`. Any
    future field addition widening this response is a separate additive-patch decision.
- **Non-Disclosure (R9-analogous — the two-hop case, decided by Invariant #11, not a local
  choice):** `vendor_slug_history`'s RLS (`USING (true)`, 6D-VSS-01.3) is unconditionally
  public-readable, and its own safety argument ("Invariant 11 intact... only migrated slugs 301")
  implicitly assumes the redirect target is live — it does not itself adjudicate a slug that was
  migrated *and later* had its vendor banned or unpublished. Read literally, that combination would
  redirect to a slug that then 404s on `get_public_vendor_profile.v1` — disclosing "this used to be
  a real vendor, now hidden," which CLAUDE.md's **Invariant #11 (private exclusion stays private,
  forever — blacklist undetectable)** forbids outright. This contract's `migrated` response is
  therefore **gated** on the migration target's current visibility, collapsing to `not_found`
  otherwise — a direct application of an existing binding invariant.
- **Validation Matrix (§B.4, query):** SYNTAX (`slug` format law) → CONTEXT (public) → AUTHZ
  (public) → SCOPE (published/non-excluded only; uniform not-found collapse per above).
- **Error Register (§B.5):** `marketplace_vendor_slug_invalid_input` (VALIDATION, retryable no —
  malformed slug) · `marketplace_vendor_slug_not_found` (NOT_FOUND, retryable no — the uniform
  collapse). Two new codes (no pre-existing slug-read error register to reuse) — statuses per
  Doc-5A §6.2 (by pointer; realized in the linked Doc-5D patch).
- **State Effects (§13):** none (query). **Idempotency (§B.7):** not-applicable (read). **Audit
  (§B.8):** no (reads are not audited, Doc-4A §17.1). **Events:** none.
- **Rate Limiting (Doc-4A §19):** throughput-type, `RATE_LIMITED` error class. Bound to the
  **already-registered** POLICY identifier `marketplace.public_read_rate_limit`
  (`Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit` — no new POLICY key registered
  by this patch). Adoption matters more here than for the sibling reads: `slug` is a
  `[a-z0-9-]{3,40}` guessing surface, and combined with the two-hop non-disclosure case above, an
  unthrottled resolver is an enumeration/probing risk.
- **Reference Validation (§B.10):** `slug` existence is folded into the uniform not-found collapse
  (absence and non-disclosure are indistinguishable — Invariant #11, same posture as
  `get_public_product_detail`'s R9 collapse).
- **Dependencies:** M2-owned structures only (`vendor_profiles.slug`, `vendor_slug_history`, both
  already frozen by `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1`). No cross-module read.
- **Shared visibility predicate:** "published + active + non-soft-deleted + non-banned" — the same
  predicate `get_public_vendor_profile.v1` already applies — is realized **once** at
  implementation time (`src/modules/marketplace/domain/policies/vendor-visibility.policy.ts`) and
  consumed by both this contract's realization and `get_public_vendor_profile`'s, rather than
  re-derived per contract.
- **AI-Agent Notes:** never widen this response with vendor metadata; never accept `slug` on any
  other contract; the `migrated` branch must re-check the target's current visibility on every
  call, not just at migration time — a vendor banned after migrating its slug must still collapse
  to `not_found`.

## Versioning & evolution (bound, not invented)

Additive-only after freeze; never rename, never remove; compatibility guaranteed within `v1`; `v2`
only via the Doc-4A §20 breaking-change table; consumers must tolerate unknown fields — the same
posture Doc-4A already applies to every other `.v1` contract in this corpus. No bespoke
deprecation or version-evolution clause is defined here: neither `Doc-4D_CanonicalHost_Patch_v1.0.2`
nor `Doc-4D_PublicProductDetail_Patch_v1.0.3` define one for themselves either.

---

# Partition impact

- **BC-MKT-6 Discovery & Read-Model:** contract inventory increases by one (**4 → 5**).
- **Doc-4D total:** contract inventory increases by one (**72 → 73**; caller-facing **65 → 66**;
  out-of-wire unchanged at 7).
- Every other BC partition, the DD register, the R-register, and all existing contracts are
  **unchanged**.

# Explicit NOT-changes

No new module · no ownership change · no entity/schema change (Doc-2/Doc-6D untouched — this
patch realizes structures `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1` already froze) · no event
coined · no state-machine change · no permission slug coined · no audit action coined · no new
POLICY key coined (adopts the existing `marketplace.public_read_rate_limit` by name only) · no
governance-signal exposure · `slug` does not become a parameter on any other contract (scope guard
above) · no change to `get_public_vendor_profile.v1`'s own request/response shape · no widening of
`vendor_slug_history`'s RLS or write path (the M8-mediated migration write remains
`[ESC-MKT-SUBDOMAIN-MIGRATE]`, untouched) · no interaction with `[ESC-7G-SLUG-MKT]` (a distinct,
still-open channel).

# Downstream resolution — landed together at this fold

- **`Doc-5D_VendorSlugResolve_Patch_v1.0.2` (linked pair):** realizes this contract on HTTP.
  **Folded together with this patch.**
- **`[ESC-MKT-SLUG-RESOLVE]`:** resolved by this patch — registry pointer updated at fold time.
- **`W3-MKT-1`** (the M2 pilot-slice WP card): un-gated at this fold.

---

*End of Doc-4D_VendorSlugResolve_Patch_v1.0.4 — one additive 21.3 Query
(`marketplace.resolve_vendor_slug.v1`) in BC-MKT-6; coins no verb beyond the contract itself, two
new error codes, no slug parameter anywhere else, no event, no audit action; adopts the existing
`marketplace.public_read_rate_limit` POLICY key; the two-hop non-disclosure gate is a direct
application of the binding Invariant #11. Linked-pair with Doc-5D_VendorSlugResolve_Patch_v1.0.2 —
approved and folded together. Status: APPROVED — FOLDED 2026-07-11 (owner ruling).*
