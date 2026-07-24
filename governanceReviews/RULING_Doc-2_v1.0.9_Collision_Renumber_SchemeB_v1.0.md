# RULING — Doc-2 v1.0.9 Version Collision · Reconcile Renumber (Scheme B)

| Field | Value |
|---|---|
| **Status** | **RULED — owner-ratified 2026-07-23** (§1–§6). **Effective v1.1** — extended by the additive **Amendment A-1** (§7, owner-ruled 2026-07-23). §1–§6 are byte-unchanged and remain frozen; A-1 is appended, never an in-place edit of them. |
| **Scope** | Identifier assignment only — changes no patch content, folds nothing. **§1–§6 coin no rule.** **§7 (Amendment A-1) coins exactly one normative rule** (sibling version lines in a reconciled slice), on owner ratification. The **patch-ID (`PATCH-Dx-NN`) axis is NOT ruled** — see §8. |
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
| Growth Hub (branch PATCH-D2-09) | v1.0.10 | **v1.0.11 / PATCH-D2-10** (owner-approved 2026-07-23) |
| VendorType Preset Values, six-value (branch PATCH-D2-10) | v1.0.13 | **v1.0.12** · patch-ID **OPEN — see §8** |

## 3. Reservations retired

**v1.0.11 / v1.0.12 hold no corpus authority** — they were branch-local drafting iterations of
PATCH-D2-10, never folded, no corpus file. They are **retired** as corpus versions and remain in
`governanceReviews/` as dated provenance. The ADR "Number reserved. Do not backfill." precedent
(ADR Compendium :58) is a one-off note about the absent ADR-019 — it does **not** bind Doc-2
numbering across a lineage reconcile, and Invariant #8 is not engaged (these numbers were never
authoritative on main's lineage).

**Scope of this clause (clarified 2026-07-23, D2-09):** it retires those two labels in the **branch** numbering space only; it reserves nothing on `main`, whose version line is assigned independently by §2 + Amendment A-1 — hence Growth Hub legitimately takes **v1.0.11** on `main`.

## 4. Renumber ≠ Fold

This ruling reassigns identifiers only. It approves and folds nothing. Each of the three folded
patches still clears its own **Review-A → Review-B → Board** gate on `main` via its forward-PR.

## 5. Version target rule (fixed)

> **Approved target range: v1.0.10 – v1.0.12.**
> If `main` receives another Doc-2 patch before the first forward-PR is cut, **stop and return to
> the owner. Do not automatically slide the versions.**

Version numbers are rank-0 architecture-governed — never developer-slidable.

## 6. Execution order

**D2-08** (→ v1.0.10 / PATCH-D2-08) → **D2-09** (→ v1.0.11 / PATCH-D2-10) → **D2-10** (→ v1.0.12, patch-ID open per §8; the linked
`Doc-4D_VendorTypePreset_Pointer_Patch` is updated in the same PR as D2-10).

Supersedes the earlier `+1` uniform-shift escalation packet (a session working record; revised to
Scheme B).

---

## 7. Amendment A-1 — Sibling version lines (additive; owner-ruled 2026-07-23)

**Raised by:** the D2-09 (Growth Hub) cut-time sweep. Scheme B §2–§6 bind only the **Doc-2** version
line; a reconciled slice is often a **linked multi-patch set** whose sibling documents each carry
their own version line. The D2-09 sweep found main's Doc-3 tip at **v1.12-absent** (tip v1.11) while
the branch's Growth Hub Doc-3 patch was authored as **v1.14** on top of a branch-only **v1.12**
(`FairnessShareWindow`, a different slice) — i.e. a branch-only gap that Scheme B did not cover.
Flagged and halted per §5 rather than slid locally.

**Normative rule (binding on every remaining reconcile PR):**

> For every linked document in a reconciled slice, use the **next verified available version on
> current `main`**. **Never** preserve branch-only version gaps. **Never** mix unrelated slices to
> preserve numbering. **Never** auto-slide if the expected target is occupied — stop and return to
> the owner.

**Scope/limits.** Additive: adds a rule, changes nothing in §1–§6. Identifier assignment only — it
does not approve, fold, or alter any patch content (§4 renumber ≠ fold still binds). "Available"
means verified against `origin/main` at PR-cut time, and includes **label ambiguity**: a target is
not available if the same version label is already in visible use for that document, even in a
different (e.g. pre-freeze authoring) namespace.

**First application (D2-09, Growth Hub):** Doc-3 `v1.14 → v1.12` (next free after main's v1.11;
`FairnessShareWindow` **not** carried — it takes its own next-available number when its slice lands)
· Doc-7E `v1.0.1 → v1.0.2` (v1.0.1 rejected as an ambiguous label: main already carries two
`Doc-7E_Content_PassN_Patch_v1.0.1` pre-freeze patches) · Doc-4C v1.0.3 · Doc-4H/4I/4J/4L/5C v1.0.1 ·
Doc-6C v1.0.4 — all already next-available on main, unchanged.

---

## 8. OPEN — patch-ID (`PATCH-Dx-NN`) axis · Flag-and-Halt (raised 2026-07-23, D2-09)

Scheme B §1–§6 and Amendment A-1 bind the **version line** only. The **patch-ID axis is unruled.**

Facts established at the D2-09 cut: `main` uses `PATCH-D2-01…09` (D2-08 = Vendor Buyer Relationship,
D2-09 = Communication Audit). Growth Hub's branch ID (D2-09) was therefore occupied on `main`, and the
owner approved **PATCH-D2-10** for it (D2-09 forward-PR) — verified free on `main` at cut time.

**Consequence requiring a ruling:** the branch's **VendorType Preset Values** patch also declares
`PATCH-D2-10`. Once Growth Hub lands as D2-10, the pending **D2-10 forward-PR** collides on the
patch-ID axis. The consistent resolution appears to be `PATCH-D2-11`, but that is a rank-0/1
identifier assignment for a future PR: **not slid locally.** Per §5 and CLAUDE.md §11 this is raised
to the owner, who may either rule the single case or ratify a general patch-ID clause (an A-2).

**Status:** OPEN — owner ruling required before the D2-10 forward-PR is cut.
