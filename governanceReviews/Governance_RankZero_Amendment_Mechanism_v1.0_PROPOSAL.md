# Governance_RankZero_Amendment_Mechanism_v1.0_PROPOSAL.md
> # ⛔ SUPERSEDED — DO NOT REVIEW, CITE, OR FOLD
>
> **Superseded by:** `governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.1_PROPOSAL.md`
> (2026-07-21).
>
> **Retained deliberately, not deleted.** This file is the reviewed v1.0 text; it is kept so the
> v1.0 → v1.1 diff remains auditable and so the Review-A record's citations resolve. A prior
> governance draft in this program was deleted after revision, permanently destroying that diff —
> that must not recur.
>
> **Review-A round 1 (2026-07-21): 🟠 REVISION REQUIRED — 1 BLOCKER · 9 MAJOR · 10 MINOR · 1 NIT ·
> 3 OBS.** Record, adjudication and rulings:
> `governanceReviews/ReviewA_Record_RankZero_Amendment_Mechanism_v1.0.md`.
>
> Headline defects, corrected in v1.1: the premise was grounded on `CLAUDE.md` and
> `00_AUTHORITY_MAP.md`, both **NON-AUTHORITATIVE**, with no rank-0/1 sweep (**B-1**) · undisclosed
> coining (**M-2**) · G-1 wrongly declared dissolved while the corpus contradicts itself today
> (**M-3**) · the `Superseded by` append duty edited a frozen file (**M-5**) · an out-of-scope
> API-version citation used four times (**M-6**).
>
> ⚠️ The §7.2 / §7.3 stamps below read *Board-RULED*; they were downgraded to **OWNER DIRECTION —
> PRE-REVIEW, NON-FOLDING**. The direction selected a drafting route; it did **not** constitute
> review acceptance, fold approval, or canonical authority.

### → intended fold form **ADR-027 — Rank-Zero Amendment Mechanism** (§7.2 — *owner direction, pre-review, non-folding*)

> **STATUS: DRAFT — GOVERNANCE INSTRUMENT; AWAITS HUMAN ARCHITECTURE BOARD APPROVAL.**
> This instrument **defines a mechanism the corpus does not currently have**. It is therefore
> itself an architecture-affecting artifact under `CLAUDE.md §8` and may be approved **only by a
> human Board** — never by a skill, including the Virtual CTO (`§7`, ranks 0–1 immutable).
>
> **Flag-and-Halt raised and not resolved locally (`§11`):** `CLAUDE.md §11` states *"Never edit a
> FROZEN document. Propose additive patches only."* A rename of a frozen table row cannot be
> expressed additively. The corpus has already recorded this same collision independently —
> `governanceReviews/BOARD-PACKET-A7R-PARTICIPATION-LENS_v0.1.md:21` describes a re-freeze as
> *"which the additive-only change model (§11) cannot express."* This instrument exists to close
> that gap **as a general rule**, not to serve one patch.
>
> **Instrument 1 of 2.** Board ruling 2026-07-21 split the vendor-type register amendment: this
> mechanism is ruled **first and separately**; only then does
> `MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1.md` (Instrument 2) become
> reviewable in final form. Rationale — circularity: *the register amendment depends on a valid
> amendment mechanism; the mechanism was being invented inside the register amendment.*

## Status

| Field | Value |
|---|---|
| Instrument type | Governance rule (mechanism), not a document patch |
| Fold target | **`ADR-027` — Board-ELECTED 2026-07-21 (§7.2).** Folds as `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md`, carried alongside the unedited `ADR_Compendium_v1.md` per the ADR-021/024/025 precedent (`00_AUTHORITY_MAP.md:54`); consolidation into ADR Compendium v2 remains a deferred human re-freeze. **Number verified free 2026-07-21** — ADR-021…026 allocated (022/023/026 are proposals; allocation is by proposal, not by fold), no ADR-027 anywhere in the repo. |
| Authority rank on fold | **Rank 1** (ADR Compendium, `CLAUDE.md §7`) — a rule governing rank-0 amendment is itself immutable to all skills. This is the reason for the election. |
| Scope | **How** a rank-0 CANONICAL document may be amended when additive patching cannot express the change. Nothing else. |
| Does NOT decide | Any content of the vendor-type register; any other pending amendment; the composition of the Architecture Board. |
| Authority | `CLAUDE.md §7/§8/§11/§13` · `00_AUTHORITY_MAP.md:30–31, 39–45` |
| Origin | Review-A round 1 **MAJ-5** (2026-07-21) → Board ruling 2026-07-21 (structural split APPROVED, base re-freeze preferred) |

---

## 1. Problem

`00_AUTHORITY_MAP.md:42` defines **FROZEN** as *"Ratified; authoritative; changed only by additive
patch + (rank 0–1) human approval."* `CLAUDE.md:192` forbids reopening a frozen document.

The model therefore admits exactly one change shape: **additive, carried alongside an unedited
base.** Every fold precedent in `00_AUTHORITY_MAP.md` follows it.

Three change shapes cannot be expressed that way:

| Shape | Why additive fails |
|---|---|
| **Correction** — frozen text is wrong (e.g. a row whose display name contradicts its own declared cells) | Adding a correct row alongside the wrong one leaves both authoritative and contradictory. |
| **Rename / re-key** — an identifier or display identity must change | The old string remains in the base; the base and the patch then disagree about identity. |
| **Removal** | Nothing additive can un-say frozen text. |

Attempting a *replacing overlay* without a precedence rule produces a **self-contradictory canonical
document**: base and patch both authoritative, both live, no tiebreak. Verified absent —
see §3.

**This is a general defect in the change model, surfaced by one patch but not specific to it.**

---

## 2. What already exists — referenced, never restated (`CLAUDE.md §11`)

This instrument coins nothing that the corpus already provides:

| Existing mechanism | Location |
|---|---|
| Authority levels `CANONICAL` · `FROZEN` · `ACTIVE` · `NON-AUTHORITATIVE` · `PROVENANCE` | `00_AUTHORITY_MAP.md:39–45` |
| Ranks 0–1 immutable to skills; change requires human approval | `CLAUDE.md:139–140`; mirrored `00_AUTHORITY_MAP.md:30–31` |
| Never edit a FROZEN document; additive patches only | `CLAUDE.md:192` |
| Flag-and-Halt on conflict with a frozen doc | `CLAUDE.md:198` |
| Raise ≠ Accept + the four-question Validate-Findings gate | `CLAUDE.md:229–238` |
| Freeze/merge gate **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** | `CLAUDE.md:225` |
| **Freeze Reconfirmation Gate** — reconfirming a freeze incorporating a verified patch | `Architecture_Freeze_Reconfirmation_v1.0.md:5` |
| **Auto-Freeze Rule** + Freeze Certification block (`Certified` / `Status: FROZEN` / `Canonical frozen artifact` / `Approved for` / `Carried forward` / `Amendment rule`) | `Doc-4D_Structure_Freeze_Gate_v1.0.md:183–191` |
| **"as amended by … re-issued as …"** — the existing name for a consolidated re-issue | `Doc-4D_Structure_Freeze_Gate_v1.0.md:187`; `Doc-4E_Structure_Freeze_Gate_v1.0.md:92` |
| `Supersedes` header row on a consolidated re-issue | `Doc-2_Domain_Model_…_v1.0.2.md:9`; `Doc-3_…_v1.0.1.md:9` |
| `Superseded by` append-only pointer on a never-edited record | `BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md:18` |
| **`effective = …`** — the corpus's expression for the resolved authoritative reading set | `00_AUTHORITY_MAP.md:75, 86, 104, 121` (~30 rows) |
| **"next free label"** — the operative version-selection practice | `Doc-5J_Content_Independent_Hard_Review_v1.0.md:57` |
| Patch grammar: *Existing Text Reference* quoted verbatim + *Amendment Text* that replaces it; replacements line-for-line, additions marked *(insert)* | `Doc-4C_PassA_Patch_v1.0.1.md:38` |
| Verification that each *Existing Text* anchor matches the base verbatim | `Doc-4D_Structure_Freeze_Gate_v1.0.md:13` |
| Review chain: Review-A → Board-ratified dispositions → focused verification → pointer re-verification (0·0·0) → folded | `00_AUTHORITY_MAP.md:65` |

### 2.1 The nearest precedent — ruled, never executed

`generatedDocs/Architecture_Freeze_Reconfirmation_v1.0.md` is the closest thing to a rank-0
amendment in the corpus, and its status must be stated precisely:

- `:104` — *"the verified §15.3 delta is **re-issued** into the Architecture file under change
  management (mechanical application of the already-verified patch; no further review required).
  The Architecture version/patch line is updated accordingly."*
- `:18` — but the frozen baseline *"is therefore **pre-patch Architecture + the verified CD-MA-1
  patch** — the standard consolidated state"*, i.e. **the live file still holds pre-patch text.**

So the corpus has **authorized re-issue into a rank-0 file once, and never performed it.** This is a
precedent for the *act* and for its *vocabulary* — it is not an executed precedent, and this
instrument does not claim otherwise.

---

## 3. The gap — what is genuinely unclaimed

Verified absent from the corpus:

| Gap | Evidence |
|---|---|
| **G-1 · Base-vs-patch precedence on disagreement** | No `takes precedence` / `overrides` statement exists at document level; the only override rule is *inter-rank* (`00_AUTHORITY_MAP.md:15`). `effective = …` is a **union**, not a tiebreak — it presumes disjointness because the model is additive-only. |
| **G-2 · A rank-0 amendment route** | No frozen rank-0/rank-1 document has ever been amended in place or re-frozen (§2.1). |
| **G-3 · Document version-label uniqueness / non-reuse** | The `never reused` rule exists only for human refs, slugs and IDs (Invariant 8). Nothing binds document labels — and the convention has already been breached: `Doc-4D` v1.0.1 was issued **twice** (`Doc-4D_PassA_Patch_v1.0.1`, `Doc-4D_PassB_Patch_v1.0.1`). |
| **G-4 · Patch-vs-major increment criterion** | Never defined. `Doc-5A_Content_v1.0_Pass10.md:59` explicitly disclaims any scheme: *"No SemVer, calendar-version, date, or major/minor/patch scheme is defined — none exists in the frozen corpus."* |

Two further gaps are **noted and deliberately NOT filled here** (§7.1): the undefined `APPROVED`
authority level, and the undefined composition of the "Architecture Board".

---

## 4. Proposed mechanism — Rank-0 Amendment by Base Re-Freeze

### RZ-1 · Admissibility (narrow)

A rank-0 amendment is admissible **only** where the change cannot be expressed additively — a
correction, a rename/re-key, or a removal (§1). **Additive patching remains the default and the
overwhelming norm**; `CLAUDE.md:192` is unchanged for every change that additive patching can carry.

A proposal invoking this route must state, and a reviewer must independently confirm, **why additive
patching cannot express the change.** Convenience, tidiness, or consolidation are not grounds.

### RZ-2 · Authorization

Human **Architecture Board** only, per `CLAUDE.md:139–140` and `:149`. No skill — including the
Virtual CTO — may authorize, execute, or fold a rank-0 amendment. Conversational approval authorizes
**drafting only**; the binding act is the Board's approval of the artifact.

Precedent for the owner acting as the human Board, referenced not coined:
`ADR-024_Canonical_Vendor_Subdomain_URLs.md:3` (*"APPROVED (owner — human Architecture Board)"*) and
`:18` (*"chat = the human-Board channel"*).

### RZ-3 · Route — base re-freeze, not a permanent overlay

The amended base is **re-issued in full** at the next free version label and re-frozen. Vocabulary is
the corpus's own (`Doc-4D_Structure_Freeze_Gate_v1.0.md:187`):

```
<base vN>  as amended by  <amendment instrument>  re-issued as  <base vN+1>
```

```
Board approval
  → amendment applied to the base (Existing Text / Amendment Text grammar, Doc-4C_PassA_Patch_v1.0.1.md:38)
  → base re-issued at the next free label
  → re-frozen via a Freeze Certification block (Doc-4D_Structure_Freeze_Gate_v1.0.md:185–191)
  → 00_AUTHORITY_MAP.md points at the new frozen version
  → prior version = PROVENANCE (historical), never concurrent authority
```

**A permanent replacing overlay is NOT adopted.** Two canonical texts must never be live
simultaneously.

### RZ-4 · Status of the superseded text

The prior version becomes **`PROVENANCE`** — `00_AUTHORITY_MAP.md:45`: *"Lifecycle record …
reference only, never reopened."* It is **historical, not concurrent authority**, and is retained,
never deleted (Invariant 8 — nothing authoritative is hard-deleted).

The re-issued base carries a `Supersedes` header row (`Doc-2_…_v1.0.2.md:9` pattern); the superseded
file carries an append-only `Superseded by` pointer (`BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md:18`
pattern) and is otherwise never edited.

### RZ-5 · Precedence — the question is dissolved, not answered

Because RZ-3 permits **no concurrent canonical texts**, G-1 does not arise for amended documents:
at any moment exactly one version of a rank-0 document is authoritative.

**This instrument expressly declines to coin a general "latest overlay wins" precedence rule.** Such
a rule would introduce layered-canon complexity the corpus does not need and would silently change
how *every* existing additive patch is read. Existing additive patches continue to be read as they
are today — `effective = base + patches` as a **union of disjoint parts** (§2). If a future need for
layered canon arises, it is a separate instrument.

### RZ-6 · Registration

On fold, all of the following in one act:

1. `00_AUTHORITY_MAP.md` — the base row's Version and Notes updated to the re-issued version; the
   superseded version recorded as `PROVENANCE`.
2. `CORPUS_INDEX.md` — file map updated.
3. `esc_registry.md` — any escalation handle the amendment closes is **amended row-wise** (scope,
   status, **and** the Interim-presentation and Channel columns), not merely flipped; a handle whose
   scope is only partly addressed retains an explicit carve-out for the unaddressed part.
4. Any **non-authoritative mirror** that restates the amended text (`CLAUDE.md`,
   `README.md`, `project_details.md`, `REPOSITORY_STRUCTURE.md`, requirement docs) is patched to
   match in the same act — `00_AUTHORITY_MAP.md:44`.

### RZ-7 · How a consumer determines the active version

Unchanged and referenced, not restated: `00_AUTHORITY_MAP.md` is the status SSoT
(`CLAUDE.md:161–162, 169`), read together with `CORPUS_INDEX.md` and, for multi-file documents, the
`effective = …` expression and the `*_SERIES_FROZEN_*` manifest. A rank-0 amendment adds no new
resolution concept — it only guarantees the expression resolves to **one** version.

### RZ-8 · Version labels (closes G-3)

- A document version label is **allocated once and never reused**, aligning document labels with the
  never-reuse discipline Invariant 8 already applies to identifiers.
- The label used is the **next free label** (`Doc-5J_…_v1.0.md:57`), determined by sweeping both
  `00_AUTHORITY_MAP.md` **and** `generatedDocs/` on disk — the Authority Map alone is insufficient,
  as the `Doc-4D` v1.0.1 double-issue demonstrates (G-3).
- **G-4 is NOT closed here.** No patch-vs-major criterion is coined; `Doc-5A_Content_v1.0_Pass10.md:59`
  disclaims any scheme, and inventing one exceeds this instrument's scope. Carried to §7.1.

---

## 5. Procedure

| # | Step | Gate |
|---|---|---|
| 1 | Amendment instrument drafted: states the change, quotes *Existing Text* verbatim, gives *Amendment Text*, and **justifies why additive patching cannot express it** (RZ-1) | — |
| 2 | **Review-A** — independent; author never self-reviews | findings raised, not ruled (`§13`) |
| 3 | Board adjudicates findings (four-question gate, `CLAUDE.md:233–238`) | Raise ≠ Accept |
| 4 | **Review-B** — independent | — |
| 5 | Verification: every *Existing Text* anchor matches the base **verbatim** (`Doc-4D_Structure_Freeze_Gate_v1.0.md:13`) | must PASS |
| 6 | **Human Board approval** of the amendment (RZ-2) | rank-0 act |
| 7 | Base re-issued + re-frozen with a Freeze Certification block (RZ-3) | **0 · 0 · 0** (`CLAUDE.md:225`) |
| 8 | Registration (RZ-6) | one act |

Steps 2–5 are the corpus's existing chain (`00_AUTHORITY_MAP.md:65`), not new process.

---

## 6. What this instrument does NOT do

- Does **not** relax `CLAUDE.md:192`. Additive-only remains the default; RZ-1 is a narrow exception
  requiring independent confirmation.
- Does **not** grant any skill authority over ranks 0–1.
- Does **not** create a standing permission to relabel, re-word, or re-key frozen content. Every
  rank-0 amendment is a discrete Board act.
- Does **not** coin a precedence rule (RZ-5), a version-increment criterion (RZ-8/G-4), the
  `APPROVED` authority level, or the composition of the Architecture Board.
- Does **not** decide any content of the vendor-type register, or of any other pending amendment.

---

## 7. Open items

### 7.1 Carried, not closed

| ID | Item |
|---|---|
| **RZ-O1** | **G-4** — patch-vs-major increment criterion undefined (`Doc-5A_Content_v1.0_Pass10.md:59` disclaims any scheme). |
| **RZ-O2** | **`APPROVED`** is used as an authority level (`00_AUTHORITY_MAP.md:59, 64, 65, 74`) but is **absent from the legend** at `:39–45`. A sixth undefined status is in live use. **Board-ruled 2026-07-21: REMAINS OPEN — separate Authority Map correction.** Not addressed by this instrument, and this instrument does not depend on it. |
| **RZ-O3** | **"Architecture Board"** appears in 400+ files with **no definition of composition or authority** anywhere; the nearest is a per-gate role roster (`Architecture_Freeze_Reconfirmation_v1.0.md:9`). **Board-ruled 2026-07-21: REMAINS OPEN — separate governance-definition work.** RZ-2 therefore authorizes by reference to the existing owner-as-human-Board precedent (`ADR-024:3, :18`), coining no definition. |

### 7.2 Fold form — **ADR-027** · ⚠️ *owner direction, pre-review, non-folding* (2026-07-21)

Elected as **`ADR-027`**, rank 1. A rule governing the amendment of rank 0 is itself immutable to
all skills (`CLAUDE.md §7`) — the stronger guarantee, and the reason for the election. Folds as
`generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md`, carried alongside the unedited
`ADR_Compendium_v1.md` per the ADR-021/024/025 precedent (`00_AUTHORITY_MAP.md:54`).

The governance-doc alternative (`Governance_Freeze_v1.0.md` precedent) is **not taken**.

### 7.3 RZ-O4 — the dangling re-issue authorization · ⚠️ *owner direction, pre-review, non-folding* (2026-07-21)

`Architecture_Freeze_Reconfirmation_v1.0.md:104` authorized re-issuing the verified CD-MA-1 §15.3
delta into the Architecture file; `:18` records it was never executed.

> **Ruling: HISTORICAL AUTHORIZATION ONLY. REVALIDATION REQUIRED BEFORE EXECUTION.**

It is **not** a live warrant. It may not be executed on its original authority, and it is **not**
discharged by this instrument. Any future execution re-enters at §5 step 1 — re-verified against the
current base under RZ-1 (why additive cannot express it) and re-approved by the Board under RZ-2.
Recorded so the authorization is neither silently revived nor silently dropped.

---

## 8. Approval block

| Gate | Status |
|---|---|
| §7.2 fold-form election | ⚠️ **OWNER DIRECTION — PRE-REVIEW, NON-FOLDING** (ADR-027). Obtained before Review-A ran, inverting §5's own chain (N-1). *The direction selected the intended drafting route. It did not constitute review acceptance, fold approval, or canonical authority.* |
| §7.3 RZ-O4 disposition | ⚠️ **OWNER DIRECTION — PRE-REVIEW, NON-FOLDING** (historical only; revalidation required). Same qualification. |
| RZ-O2 / RZ-O3 | ⚠️ **OWNER DIRECTION — PRE-REVIEW** — remain open, separate work; not blocking. |
| Review-A (independent) — v1.0 | ✅ run 2026-07-21 → 🟠 **REVISION REQUIRED** (1·9·10·1·3) |
| Revision against round 1 | ☐ not done |
| Review-A (independent) — revised | ☐ not run |
| Review-B (independent) | ☐ not run |
| Human Architecture Board — mechanism approval | ☐ not granted |
| Fold as `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md` + `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md` registration | ☐ blocked |
| **Instrument 2** (`MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1.md`) unblocked | ☐ blocked on this instrument |

Freeze/merge gate (`CLAUDE.md §13`): **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** before fold.

*End of Governance_RankZero_Amendment_Mechanism_v1.0 (PROPOSED) — defines admissibility,
authorization, route (base re-freeze), superseded-text status, registration, active-version
resolution and version-label uniqueness for rank-0 amendments. Coins no precedence rule, no version
scheme, no authority level, no Board definition. DRAFT — awaits HUMAN approval; not folded by AI.*
