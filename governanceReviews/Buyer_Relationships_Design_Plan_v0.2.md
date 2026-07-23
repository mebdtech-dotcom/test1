# Buyer Relationships — UI/UX Design Plan

> **Provenance (branch authoring record) — reconciled to `main` in the D2-08 forward-PR.** The patch this record authored folded on `main` as **Doc-2 v1.0.10 (PATCH-D2-08)**; in-body references to "v1.0.9" are the branch-authoring number (on `main`, v1.0.9 = the Communication Audit patch). Renumber per `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md` (Scheme B).

**Version:** v0.2 · **Date:** 2026-07-19 · **Status:** FREEZE-READY (design freeze = build-gate
step 3; not yet frozen)
**Scope:** DESIGN-ONLY until the Doc-4F/BC-OPS additive patch is approved. This plan is additive
to the existing implementation corpus — it is not a CRM redesign.
**Derived from:** `governanceReviews/Cluster_1_2_Governance_Closure_and_Team1_Handoff_v1.0.md`
(v1.1 — carries Amendment A1 below) · D2/D4 rulings (five seeding channels · Provenance Ladder ·
Provenance ≠ Stage · privacy floor) · owner design rulings of 2026-07-19 (§11 approval record).
**Baseline at draft time:** Phase-1 `fb86e66` — surface reads "Buyer Relationships" user-facing,
internal term "Buyer CRM", tiles render "—", governance header comment carries the ruled model.

---

## 0. Governance position — D4-C4 Amendment A1 (owner-ruled 2026-07-19)

Recorded as an **additive amendment** to D4-C4, not an accidental replacement:

```text
D4-C4 AMENDMENT A1

The Buyer CRM surface is renamed at both presentation and route levels.

Canonical index:   /sell/buyer-relationships
Canonical detail:  /sell/buyer-relationships/[relationshipId]

Legacy route:      /sell/buyer-crm
Legacy behavior:   Permanent 308 redirect to the canonical index route.
                   Query parameters preserved where technically supported
                   (e.g. /sell/buyer-crm?provenance=RFQ_PARTICIPATION
                    → /sell/buyer-relationships?provenance=RFQ_PARTICIPATION).

Reason:            Align the user-facing navigation label, page title, copied
                   URLs, deep links, and canonical detail hierarchy under one
                   route base.
```

**Implementation constraint (binding):** do NOT maintain two active route trees.
`/sell/buyer-crm` exists only as a redirect source — it must not render the page, host nested
detail routes, or become an alternate canonical URL.

Internal domain term remains **"Buyer CRM"** (D4-C5 unchanged): no `BuyerRelationship` domain
concept, type, or entity is minted; component/directory/analytics identifiers unchanged unless a
rename is separately approved.

## 1. Design inputs

**Ruled (design against):**
- Five seeding channels (manual · RFQ participation · engagement · conversation contact-tier ·
  import-with-strict-controls) — D2.
- Provenance Ladder: `MANUAL_OR_IMPORTED < CONVERSATION < RFQ_PARTICIPATION < ENGAGEMENT <
  AWARDED_CUSTOMER`; max-over-history; never decays; manual edits never erase observed
  provenance — D2/D4.
- **Provenance ≠ Stage**: system evidence vs vendor-managed state — D4.
- **Stage vocabulary (ruled 2026-07-19, §6)**: `NEW · DEVELOPING · ACTIVE · DORMANT · ARCHIVED`.
- Privacy floor: own-participation facts only; private-CRM voice; buyer-side decisions
  undetectable — D2.
- Canonical routes per Amendment A1 (§0).

**Open (design around — never coin):**
- Import strict controls (Doc-4F patch + Doc-3 POLICY values) → import flow designed last.
- All reads/commands unwired → every affordance ships structure-only per §7 (VX-03: wired read or
  honest empty, never fixtures).
- Exact enum/audit-action wire names — minted only in the Doc-4F patch (canonical audited-write
  pattern; nothing invented in UI code).

## 2. Page architecture (approved)

```text
┌─ PageHeader ─ "Buyer Relationships" ─────────── [ Import ] [ Add buyer ] ──┐
│                     both plain-disabled pre-wiring; Import tooltip:        │
│                     "Import controls are not yet available."               │
├─ KPI band ── Buyers | Awarded customers | RFQs received | Engagements ─────┤
│              adapter-supplied own-facts · "—" until wired                  │
├─ Toolbar ── [search name] [Provenance ▾] [Stage ▾*] ── sort: last-int. ────┤
│             *mounts only after the stage enum lands in the Doc-4F rider    │
├─ TABLE (desktop) / cards (mobile) ─────────────────────────────────────────┤
│  Buyer            Provenance             Stage        Last interaction  →  │
│  <name>           ◇ <tier>               —            <fact · date>     →  │
│  <name>           ◆ Awarded customer     —            <fact · date>     →  │
├─ cursor "Load more" (no totals) ───────────────────────────────────────────┤
└────────────────────────────────────────────────────────────────────────────┘
Row click → detail drawer (desktop) · canonical page for copied URLs/mobile (§5)
```

KPI note: "Awarded customers" (provenance-derived, deterministic, monotone) replaces the earlier
"Active" tile (stage-dependent — rejected). All four values adapter-supplied; never
client-computed (R7).

## 3. The two-badge system

| | Provenance (system) | Stage (vendor) |
|---|---|---|
| Style | **Outline** badge, muted border, diamond glyph | **Filled** badge, soft tint |
| Editable | Never — no edit path exists in any surface | Via the audited flow in §6 only |
| Color | Neutral for four tiers; **`◆ Awarded customer` alone** takes a restrained **gold border/glyph/text** treatment — never solid gold fill, never gradients, never premium-marketing or platform-certification language | Semantic tints per §6 vocabulary |
| Tooltip | Awarded tier verbatim: *"Evidence tier derived from your awarded engagement history."* Others: *"Evidence tier — derived from verified interactions."* | Stage name + §6 definition |
| A11y | Tier name always in text, never color-only; `aria-label="Evidence: <tier>"` | same pattern |

## 4. Toolbar & URL grammar

The established allowlist convention (documents-hub / rfqs pattern): filters are plain Links, the
URL is the single source of truth, unknown tokens ⇒ All.

- `?provenance=` — allowlisted over the five ruled tiers.
- `?stage=` — mounts only after the vocabulary lands in the Doc-4F rider; allowlisted over the
  five ruled stages (`ARCHIVED` filterable back in — reversibility, §6).
- Search: buyer name only (own records). Default sort: last verified interaction desc.
- No client-computed counts anywhere in the toolbar or chips.
- Legacy-redirect query preservation per Amendment A1.

## 5. Detail — drawer primary, page canonical

- **Canonical route:** `/sell/buyer-relationships/[relationshipId]`.
- Desktop row click → **drawer** (rapid review without losing table context). Open-in-new-tab /
  copied URL → **canonical page**. Mobile → canonical full page (or full-screen sheet).
- Drawer and page consume **one detail projection and one component set** — the drawer is a
  presentation of the page, never a fork. This keeps the drawer from becoming an architectural
  dead end as activity, notes, contacts, or pointers expand.

```text
┌ DETAIL (drawer or page) ─────────────────────────┐
│ <Buyer org name>                                 │
│ ◆ <provenance tier>      Stage: — / [<stage> ▾]  │
├─ PROVENANCE TIMELINE (append-only, read-only) ───┤
│ ● <tier reached>   <human_ref deep-link> · date  │
│ ● …descending verified facts…                    │
├─ ACTIVITY (vendor-private notes) ────────────────┤
│ [Log activity]  … entries …                      │
├─ RELATED (pointer lists — links only) ───────────┤
│ RFQs from this buyer      → /sell/rfqs           │
│ Engagements               → /sell/engagements/…  │
│ Conversations             → Messages (post-inbox)│
└──────────────────────────────────────────────────┘
```

Rules: the timeline renders verified facts with their refs (facts the vendor already holds),
one component grammar shared across surfaces. **Related = pointers only** — never re-render
RFQ/engagement content inside this surface (duplication guard). The Conversations pointer stays
disabled until the unified inbox exists.

## 6. Stage system (ruled 2026-07-19)

Vendor-managed, non-linear (any→any):

| Stage | Label | Meaning |
|---|---|---|
| `NEW` | New | Added recently and not yet actively managed |
| `DEVELOPING` | Developing | Relationship-building or early commercial interaction |
| `ACTIVE` | Active | Currently maintained as an active buyer relationship |
| `DORMANT` | Dormant | Known relationship with no current activity |
| `ARCHIVED` | Archived | Intentionally removed from the active CRM working set |

**Binding constraints:**
- Stage never changes provenance; the two badges never merge or share a control.
- **Every stage change is audited.** Interaction: badge click → menu opens → select stage →
  **explicit confirmation or deterministic save** → audit entry. Never a single accidental-click
  mutation. (Audit action minted in the Doc-4F patch — never invented in UI code.)
- `ARCHIVED` is reversible (un-archive uses the same confirmed, audited flow).
- Defaults: manual/imported records ⇒ `NEW`, never `ACTIVE`. The add-buyer flow never asks for a
  stage.
- Forbidden stage values: `Customer` · `Won` · `Qualified` · `RFQ participant` — they would
  duplicate provenance or opportunity state. Enforced at contract level; the UI never renders
  write affordances for them.
- No automatic stage transitions in the initial contract; the UI shows no "suggested stage"
  affordances.

**Pre-wiring / pre-rider rendering rule:** the stage renders as the literal text `Stage: —`.
No fake disabled select is ever rendered.

## 7. Actions & pre-wiring states

| Action | Channel | Pre-wiring state |
|---|---|---|
| Add buyer | manual (approved) | Plain disabled button, present in header |
| Log activity | manual note | Plain disabled (exists today) |
| Stage change | vendor management | Absent — `Stage: —` until rider + wiring (§6) |
| Import | approved w/ strict controls | Plain disabled `[ Import ]`, tooltip *"Import controls are not yet available."* — no alarm glyphs; flow designed only after controls are defined |

## 8. State matrix (VX-03-compliant)

- **Empty:** the canonical "No buyers yet" copy — one byte-stable copy, component-owned.
- **Loading:** skeleton rows matching the table rhythm.
- **Populated:** from wired reads only — never fixtures, never sample rows.
- **Error:** kit error state with retry.
- **Partial records:** drawer/page sections render their own empties ("No activity logged");
  stage renders `—` in every state until the vocabulary is in the contract and the write is wired.

## 9. Privacy floor as design rules

No buyer-side anything: no "viewed your profile", no online/last-seen, no buyer's own CRM state,
nothing inferable about buyer private decisions (Inv #11, symmetric). No platform-voiced claims —
provenance tooltips speak in own-history voice only. No auto-labels: nothing ever calls a contact
a "qualified lead" or "customer" beyond its verified tier. No exported or shareable views.

## 10. Build gate

```text
1. Doc-4F/BC-OPS additive contracts (reads · provenance enum · stage enum ·
   audited stage-write · seeding events)
2. Carry the RULED stage vocabulary + §6 constraints into that rider (a carry,
   not an open decision)
3. Design freeze of this plan (owner sign-off; Review-A design pass as scheduled)
4. Presentation build vs adapter interfaces (VX-03 posture) — includes the
   Amendment A1 route rename + 308 legacy redirect
5. Read/command wiring (stage select mounts here)
6. Import controls + flow last
```

## 11. Approval record (owner rulings, 2026-07-19)

1. KPI "Active" → **"Awarded customers"** — APPROVED.
2. Gold accent for `AWARDED_CUSTOMER` — APPROVED WITH RESTRAINT (border/glyph/text only).
3. Detail surface — **DRAWER PRIMARY, PAGE CANONICAL** with shared projection/components.
4. Stage vocabulary — RULED as one set (§6), not options.
5. Correction: no single-click stage mutation; menu + explicit confirm + audit.
6. Correction: Import renders plain-disabled; no alarm glyph.
7. Route — **Option (a)** ruled; Amendment A1 (§0) with query preservation and the
   single-route-tree constraint.

Delta log v0.1 → v0.2: all seven items above incorporated; stage moved from "open input" to
"ruled"; route moved from "pending flag" to "ruled, Amendment A1".
