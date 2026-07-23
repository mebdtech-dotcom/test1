# RULING — Doc-2 v1.0.9 Version Collision · Reconcile Renumber (Scheme B)

| Field | Value |
|---|---|
| **Status** | **RULED — owner-ratified 2026-07-23.** CTO ruling; frozen. |
| **Scope** | Identifier collision only. Reassigns Doc-2 patch version numbers during the `fe/account-referral-nav` → `main` reconcile. Coins no rule, changes no patch content, folds nothing. |
| **Authority** | Virtual CTO (rank 2), owner-ratified. Version numbers are rank-0 architecture-governed. |
| **Mechanics** | Held OUT of this ruling — tracked in a separate reconcile execution checklist kept with the reconcile working records (not carried into the corpus). |

---

## 1. Conflict

Two divergent lineages both minted **Doc-2 v1.0.9** with disjoint, both-folded content:

- **`main`** `generatedDocs/Doc-2_Patch_v1.0.9.md` = **Communication (Support-Ticket) Audit Actions**
  — folded 2026-07-11, live on the trunk.
- **branch** `generatedDocs/Doc-2_Patch_v1.0.9.md` = **PATCH-D2-08 Vendor Buyer Relationship
  Aggregate** — folded 2026-07-19.

The branch then continued independently: v1.0.10 Growth Hub (PATCH-D2-09), v1.0.13 VendorType Preset
Values (PATCH-D2-10, six-value), with **v1.0.11 / v1.0.12 reserved** (superseded five-value drafting
iterations of PATCH-D2-10; no corpus file — they exist only in `governanceReviews/`). Verified:
`main`'s Doc-2 patch series ends at v1.0.9, so v1.0.10+ are free on main.

## 2. Ruling — Scheme B (compact / clean-trunk)

Direction is forced, not chosen: `main`'s v1.0.9 (Comm Audit) is shipped on the trunk and
**immovable**. The branch chain renumbers compactly onto it, yielding a clean monotone Doc-2 line
where every corpus version maps to exactly one folded patch.

| Patch | now | → main |
|---|---|---|
| Communication Audit (already on main) | v1.0.9 | **v1.0.9** (unchanged) |
| PATCH-D2-08 Vendor Buyer Relationship | v1.0.9 | **v1.0.10** |
| PATCH-D2-09 Growth Hub | v1.0.10 | **v1.0.11** |
| PATCH-D2-10 VendorType Preset Values (six-value) | v1.0.13 | **v1.0.12** |

## 3. Reservations retired

**v1.0.11 / v1.0.12 hold no corpus authority** — they were branch-local drafting iterations of
PATCH-D2-10, never folded, no corpus file. They are **retired** as corpus versions and remain in
`governanceReviews/` as dated provenance. The ADR "Number reserved. Do not backfill." precedent
(ADR Compendium :58) is a one-off note about the absent ADR-019 — it does **not** bind Doc-2
numbering across a lineage reconcile, and Invariant #8 is not engaged (these numbers were never
authoritative on main's lineage).

## 4. Renumber ≠ Fold

This ruling reassigns identifiers only. It approves and folds nothing. Each of the three folded
patches still clears its own **Review-A → Review-B → Board** gate on `main` via its forward-PR.

## 5. Version target rule (fixed)

> **Approved target range: v1.0.10 – v1.0.12.**
> If `main` receives another Doc-2 patch before the first forward-PR is cut, **stop and return to
> the owner. Do not automatically slide the versions.**

Version numbers are rank-0 architecture-governed — never developer-slidable.

## 6. Execution order

**D2-08** (→ v1.0.10) → **D2-09** (→ v1.0.11) → **D2-10** (→ v1.0.12; the linked
`Doc-4D_VendorTypePreset_Pointer_Patch` is updated in the same PR as D2-10).

Supersedes the earlier `+1` uniform-shift escalation packet (a session working record; revised to
Scheme B).
