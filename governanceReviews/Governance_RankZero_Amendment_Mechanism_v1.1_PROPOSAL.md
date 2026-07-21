# Governance_RankZero_Amendment_Mechanism_v1.1_PROPOSAL.md
### → intended fold form **ADR-027 — Rank-Zero Amendment Mechanism**

> ## ⛔ SUPERSEDED by `Governance_RankZero_Amendment_Mechanism_v1.2_PROPOSAL.md` (2026-07-21)
> **Do not cite this draft as the instrument.** Review-A round 2 raised **B-1** (the *"ranks 0 and 1
> are SILENT"* thesis is unsupportable) and the Board **accepted** it — record and adjudication:
> `ReviewA_Record_RankZero_Amendment_Mechanism_v1.1.md` §5. In particular, the following are
> **struck** in v1.2: the first-instance framing · the §1.1 SILENT finding · RZ-1's four-condition
> admissibility test · RZ-3's *"the Authority Map is the only place that says which version is
> active"* · §5's characterization of legacy folds as *"correctly additive"* · RZ-8's `Doc-4D`
> double-issue argument · §7.3's *"not a gate"* treatment of `CLAUDE.md`.
> Retained unedited below the banner so the v1.1 → v1.2 diff stays auditable.
> *(This banner is an in-place edit of a `governanceReviews/` working draft — outside RZ-4's rank-0
> scope, and disclosed in v1.2 §RZ-4 rather than concealed.)*

> **STATUS: DRAFT — FIRST-INSTANCE GOVERNANCE RULE; AWAITS HUMAN ARCHITECTURE BOARD APPROVAL.**
> Architecture-affecting under `CLAUDE.md:149`; approvable only by a human Board, never by a skill
> (`CLAUDE.md:139–140`).
>
> **This instrument is FIRST-INSTANCE, not an exception.** Rank 0 (`Master_System_Architecture_v1.0_FINAL.md`)
> and rank 1 (`ADR_Compendium_v1.md`) contain **no corpus-amendment procedure** (§1.1, swept
> 2026-07-21). ADR-027 establishes that procedure. It does **not** describe itself as an exception
> to `CLAUDE.md` or to `00_AUTHORITY_MAP.md` — both of which declare themselves **NON-AUTHORITATIVE**
> (`00_AUTHORITY_MAP.md:216`, `:187`) and therefore cannot be the rule this instrument departs from.
>
> **Scope boundary — read this before citing it:** ADR-027 governs **future rank-0 canonical
> amendments only.** It does **not** reconcile, interpret, or determine precedence among the
> existing `effective =` base+patch corpus. Those remain governed by a **separate, future legacy
> reconciliation instrument** (§4).
>
> **Revision v1.0 → v1.1** against Review-A round 1 (🟠 REVISION REQUIRED — 1 BLOCKER · 9 MAJOR ·
> 10 MINOR · 1 NIT · 3 OBS). Record, adjudication and Board rulings:
> `governanceReviews/ReviewA_Record_RankZero_Amendment_Mechanism_v1.0.md`. The v1.0 draft is
> retained on disk marked SUPERSEDED — not deleted — so the v1.0 → v1.1 diff stays auditable.

## Status

| Field | Value |
|---|---|
| Instrument type | Governance rule (mechanism), first-instance |
| Intended fold form | **ADR-027** — `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md`, carried alongside the unedited `ADR_Compendium_v1.md` per the ADR-021/024/025 precedent (`00_AUTHORITY_MAP.md:54`). ⚠️ **Owner direction, pre-review, non-folding** — it selected the drafting route; it did **not** constitute review acceptance, fold approval, or canonical authority. |
| Authority basis | A **human Board act** under the human-approval carve-out at `CLAUDE.md:139–140`. Rank-1 status confers immutability-to-skills; it does **not** confer competence over rank 0 (§5, RZ-2). |
| Scope | **How** a rank-0 CANONICAL document may be amended in future when additive patching cannot express the change. |
| Explicitly out of scope | The legacy `effective =` overlay corpus (§4) · any content of any pending amendment · the composition of the Architecture Board · a version-numbering scheme · the undefined authority levels. |
| Rank 0/1 sweep | Performed 2026-07-21 (§1.1) — **no corpus-amendment procedure found at either rank.** |
| Origin | Review-A MAJ-5 on the vendor-type register amendment → structural split (owner direction 2026-07-21) |

---

## 1. Problem

### 1.1 What rank 0 and rank 1 actually say — the sweep

`CLAUDE.md:197` requires anchors be programmatically confirmed against the frozen corpus. v1.0 of
this instrument failed that: it grounded its premise on two non-authoritative files and never swept
ranks 0–1 (Review-A **B-1**). The sweep, performed 2026-07-21:

| Rank-0 / rank-1 anchor | Text | Bearing on corpus amendment |
|---|---|---|
| `Master_System_Architecture_v1.0_FINAL.md:284` (Invariant 8) | *"Controlled documents are versioned, never edited in place."* | **Analogous principle only.** `:1186–1196` scopes "version-controlled documents" to **product specifications, procurement documents, company documents** — business records, not corpus documents. |
| `Master…FINAL.md:1194` | *"**Never overwrite** — v1 → v2 → v3; never edit in place. Revisions are labeled."* | Same scope (business documents). Analogous, not governing. |
| `ADR_Compendium_v1.md:9` | Compendium supersedes individual ADRs **for reading** | Reading precedence between ADR forms. Not corpus amendment. |
| `ADR_Compendium_v1.md:511` | "never overwrite" | RFQ-scoped. Not corpus amendment. |

> **Finding: ranks 0 and 1 are SILENT on how an architecture-corpus document is amended.**

### 1.2 Where the additive-only rule actually lives

| Statement | Location | Authority level |
|---|---|---|
| *"changed only by additive patch + (rank 0–1) human approval"* | `00_AUTHORITY_MAP.md:42` | **NON-AUTHORITATIVE** (`:187`) — and `:7–9` states the map *"only states which document decides; it never restates a decision."* |
| *"Never edit a FROZEN document. Propose additive patches only."* | `CLAUDE.md:192` | **NON-AUTHORITATIVE** (`00_AUTHORITY_MAP.md:216`) |
| *"Changing [ranks 0–1] requires an **additive** architecture patch with human approval"* | `CLAUDE.md:139–140`; mirrored `00_AUTHORITY_MAP.md:30–31` | **NON-AUTHORITATIVE** |

The word **"additive"** in `CLAUDE.md:139–140` is quoted here in full, restored after v1.0 dropped
it (Review-A **M-1**). The tension is stated rather than elided: **this instrument authorizes a
non-additive act.** Because the clause bearing "additive" sits in a non-authoritative mirror and the
authoritative ranks are silent, ADR-027 does not override a superior rule — it supplies a rule where
none exists, at a rank above the mirrors. The mirrors are then synchronized downstream (§7.3).

### 1.3 The change shapes additive patching cannot express

| Shape | Why an additive overlay fails |
|---|---|
| **Correction of normative canonical text** | An overlay asserting the correct proposition leaves the base asserting the incorrect one. Both live, both authoritative, no tiebreak. |
| **Rename / re-key** | The superseded identifier remains in the base; base and overlay then disagree about identity. |
| **Removal** | Nothing additive can un-say frozen text. |

Each produces the same failure: **two simultaneously authoritative texts contradicting each other on
one proposition.** That this failure is real and not hypothetical is demonstrated by the existing
corpus (§4) — which is the reason the Board rejected overlays as the *future* model rather than
adopting them.

### 1.4 Consequence

ADR-027 is the **first-instance rule** on rank-0 corpus amendment. Framing it as a "narrow exception"
would be incoherent, since the rule it would except is stated only in non-authoritative files
(Review-A **M-9**). v1.0's claim *"does not relax `CLAUDE.md:192`"* is **struck**.

---

## 2. Evidence — what already exists (referenced, never restated, `CLAUDE.md:193`)

**The authority-level column is load-bearing.** v1.0 presented these anchors in one flat table,
which is what allowed non-authoritative sources to carry a rank-1 premise (Review-A **m-9**).
Nothing below rank 1 authorizes anything in §5; the lower-level rows are cited as **existing
vocabulary and practice to reuse**, not as authority.

| Existing item | Location | Authority level |
|---|---|---|
| Controlled documents versioned, never edited in place (business docs) | `Master…FINAL.md:284`, `:1186–1196` | **rank 0 — CANONICAL** (analogy only) |
| Compendium/ADR reading precedence | `ADR_Compendium_v1.md:9` | **rank 1 — FROZEN** (not on point) |
| Authority levels `CANONICAL`/`FROZEN`/`ACTIVE`/`NON-AUTHORITATIVE`/`PROVENANCE` | `00_AUTHORITY_MAP.md:39–45` | NON-AUTHORITATIVE |
| Ranks 0–1 immutable to skills; **additive** patch + human approval | `CLAUDE.md:139–140` | NON-AUTHORITATIVE |
| Never edit a FROZEN document | `CLAUDE.md:192` | NON-AUTHORITATIVE |
| Reference-never-restate · Verify before delivering · Flag-and-Halt | `CLAUDE.md:193`, `:197`, `:198` | NON-AUTHORITATIVE |
| Raise ≠ Accept + four-question gate | `CLAUDE.md:229–238` | NON-AUTHORITATIVE |
| Freeze gate **0 · 0 · 0** | `CLAUDE.md:225` | NON-AUTHORITATIVE |
| Status SSoT = `00_AUTHORITY_MAP.md` + `Program_Status_And_Roadmap.md` | `CLAUDE.md:167–168` | NON-AUTHORITATIVE |
| **Freeze Reconfirmation Gate** | `Architecture_Freeze_Reconfirmation_v1.0.md:5` | PROVENANCE |
| Freeze Certification block (`Certified` / `Status: FROZEN` / `Canonical frozen artifact` / `Approved for` / `Carried forward` / `Amendment rule`) | `Doc-4D_Structure_Freeze_Gate_v1.0.md:183–191` | PROVENANCE |
| **"as amended by … re-issued as …"** | `Doc-4D_Structure_Freeze_Gate_v1.0.md:187`; `Doc-4E_Structure_Freeze_Gate_v1.0.md:92` | PROVENANCE — ⚠️ both are **pre-freeze consolidations** (Proposal v0.1 → FROZEN v1.0), **not** amendment of an already-frozen base |
| *Existing Text* anchor must match the base **verbatim** | `Doc-4D_Structure_Freeze_Gate_v1.0.md:12` | PROVENANCE |
| Existing-Text / Amendment-Text patch grammar | `Doc-4C_PassA_Patch_v1.0.1.md:38` | FROZEN (patch) |
| `Supersedes` header row on a consolidated re-issue | `Doc-2_…_v1.0.2.md:9`; `Doc-3_…_v1.0.1.md:9` | FROZEN |
| `effective = …` composition expression (~30 rows) | `00_AUTHORITY_MAP.md:75, 86, 104, 121` | NON-AUTHORITATIVE |
| Review chain A → dispositions → verification → fold | `00_AUTHORITY_MAP.md:65` | NON-AUTHORITATIVE |
| ADR carried alongside the unedited Compendium | `00_AUTHORITY_MAP.md:54`; `ADR-024…:3–12` | NON-AUTHORITATIVE / FROZEN |
| Owner acting as the human Board | `ADR-024_Canonical_Vendor_Subdomain_URLs.md:3`, `:18` | FROZEN (ADR) |

**Withdrawn from v1.0's evidence set:**

- `Doc-5A_Content_v1.0_Pass10.md:59` — **removed entirely.** It governs the `Iv-Api-Version`
  **API-surface identifier**, and `:61` binds that such identifiers *"MUST NOT be interpreted as a
  domain, entity, state-machine, or event version."* It is not evidence about document version
  labels (Review-A **M-6**).
- `BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md:18` (`Superseded by` pointer) — **removed**; the duty it
  supported is struck (§5, RZ-4).
- `Doc-5J_Content_Independent_Hard_Review_v1.0.md:57` — **demoted.** It reads *"Next free **version**
  = `v1.7`"* about Doc-3 policy-key patch numbering, in a PROVENANCE record. Cited below only as
  evidence that the *practice* exists, never as a normative rule (Review-A **m-6**).
- `BOARD-PACKET-A7R-PARTICIPATION-LENS_v0.1.md:21` — **demoted.** A v0.1 draft packet in
  `governanceReviews/`, not the corpus; v1.0's claim that *"the corpus has already recorded this
  collision"* was inflated (Review-A **m-5**). Retained as a corroborating observation only.
- `Governance_Freeze_v1.0.md` — noted at its true path (**repo root**, not `generatedDocs/`),
  NON-AUTHORITATIVE (`:7`), Authority-Map-unregistered, and `:8` scopes it to *"the repository
  governance/orientation layer only — **not** the frozen architecture corpus"* (Review-A **OBS-1**).

### 2.1 The nearest precedent — stated in both directions

`generatedDocs/Architecture_Freeze_Reconfirmation_v1.0.md`:

**For** an established re-issue practice: `:18` calls re-issue *"the standard consolidated state"*;
`:104` states the verified delta *"is **re-issued** into the Architecture file under change
management (mechanical application of the already-verified patch; **no further review required**).
The Architecture version/patch line is updated accordingly."*

**Against** treating it as precedent for this instrument: (a) it was **never executed** — `:18`
records the frozen baseline as *"pre-patch Architecture + the verified CD-MA-1 patch"*, and
`Master…FINAL.md:1004–1015` still holds the pre-patch §15.3 rows; (b) the CD-MA-1 delta was
**purely additive** (catalog completeness), so it is **not** precedent for the correction, rename or
removal shapes RZ-1 admits.

v1.0 cited only the second direction (Review-A **m-8**). Both are now stated. The precedent supplies
**vocabulary and a ruled-once posture** — not authority, and not a worked example of the shapes at
issue.

---

## 3. What this instrument coins

v1.0 asserted it *"coins nothing that the corpus already provides"* — a tautology that concealed
real coining (Review-A **M-2**). Every coined element is enumerated here.

| Coined | Where | Note |
|---|---|---|
| **Admissibility test** for a rank-0 amendment, incl. the exclusion list and the recorded negative test | RZ-1 | New. No corpus equivalent. |
| **The route itself** — base re-freeze by complete re-issue | RZ-3 | New as a *rule*; reuses existing vocabulary. |
| **Superseded-version status** and its registry treatment | RZ-4 | New. ⚠️ Depends on an Authority Map legend value that **does not yet exist** — see §8 RZ-O2. |
| **Authority Map registration duty** for an amendment fold | RZ-6.1 | New as a normative duty. |
| **Document version-label non-reuse** | RZ-8 | New binding rule. An **extension by analogy** from Invariant 8's identifier non-reuse, which `Master…:282–284` scopes to human refs, slugs and IDs — not a restatement. |
| **"Next unused label"** as the selection rule | RZ-8 | Elevates an observed practice to a rule. |

**Not coined, expressly:** a base/patch precedence rule (§4) · a version-numbering or
patch-vs-major scheme (RZ-8) · the `APPROVED` or `RATIFIED` authority levels (§8) · the composition
of the Architecture Board (§8) · any change to how existing overlays are read (§4).

---

## 4. What this instrument does NOT resolve — the legacy overlay corpus

**ADR-027 does not reconcile the existing overlay corpus.** It does not interpret, tiebreak, or
retroactively determine precedence among existing lower-rank base + patch combinations. It applies
**only to future rank-0 canonical amendments**.

The legacy defect is real and is recorded here so it is not mistaken for resolved:

| Evidence | Location |
|---|---|
| `Doc-6C_Patch_v1.0.1` **corrects** its frozen base's permission-slug count **45 → 43**, base untouched — both live, contradictory, **no tiebreak** | `00_AUTHORITY_MAP.md:123` |
| The same count then moves 43 → 45 → 46 → 47 across further patches — four overlapping claims about one number | `00_AUTHORITY_MAP.md:121` |
| `Doc-5D_Patch_v1.0.1` carries *"a conformance correction"* | `00_AUTHORITY_MAP.md:86` |
| `Doc-4M v1.0.1/v1.0.2` index corrections, base untouched — note Doc-4M is *"**non-normative by its own header**; canonical machines = Doc-2 §5"* | `00_AUTHORITY_MAP.md:72` |

> **G-1 — Legacy base/patch precedence.**
> **Status: OPEN.** **Scope:** the existing `effective =` overlay corpus.
> **Resolved by ADR-027: NO.** **Resolution vehicle:** a separate, future legacy reconciliation
> instrument.

v1.0 claimed this question was *"dissolved, not answered."* That was wrong for the existing corpus
(Review-A **M-3**) and the claim is **withdrawn**. The dissolution in RZ-5 applies **only** to
documents amended under RZ-3 going forward.

**Board rationale of record for not generalizing overlays:** the Doc-6C discovery proves the
additive-only practice *accumulated unresolved contradictions*; it does not make corrective overlays
the right future model. Adopting them because legacy debt exists would institutionalize the weakness
— *legacy ambiguity → future governance model.* The deterministic rule is preferred because
reconstructing authority from a base plus an arbitrary chain of patches is harder for engineers,
reviewers and AI agents than reading one complete current version.

The future reconciliation instrument's remit (recorded, not authorized here): inventory every frozen
base + effective patch set · separate genuine contradictions from additive disjoint extensions ·
define the authoritative effective reading per legacy set · consolidate contradictory sets into a
complete re-issued canonical version · retire the ambiguity once consolidated.

---

## 5. Mechanism — Rank-0 Amendment by Base Re-Freeze

### RZ-1 · Admissibility (narrow, with a stated test)

A rank-0 amendment is admissible **only** where **all four** hold:

1. The target is **normative canonical text** at rank 0.
2. The change is a **correction**, a **rename / re-key**, or a **removal** (§1.3).
3. **No additive formulation exists** that does not leave the base and the overlay simultaneously
   authoritative and **contradictory on the same proposition**.
4. The proposer records a **negative test** — the additive formulation actually attempted, and why
   it fails condition 3 — and an **independent reviewer confirms it**. Absent a recorded negative
   test, the amendment is inadmissible.

**Exclusions — these remain additive and may not use this route:**

| Excluded | Precedent |
|---|---|
| Convenience, tidiness, or consolidation | — |
| Correcting a **non-normative** index or navigational artifact | `Doc-4M v1.0.1/v1.0.2` — *"non-normative by its own header"* (`00_AUTHORITY_MAP.md:72`) |
| Correcting a **derived** document to match a higher authority that is itself untouched | `Doc-6C_Patch_v1.0.1` — *"corrects Doc-6C §5.1 … to match Doc-2 §7's enumeration (the sole content authority, untouched)"* (`:123`) |
| Conformance corrections within a realization document | `Doc-5D_Patch_v1.0.1` (`:86`) |

These four folds are thereby **reconciled, not contradicted**: each was correctly additive, because
none amended normative rank-0 canonical text. v1.0's blanket claim that corrections cannot be
additive was too broad (Review-A **M-4**, partially accepted).

Additive patching remains the **default and the overwhelming norm**.

### RZ-2 · Authorization

Human **Architecture Board** only. No skill — including the Virtual CTO — may authorize, execute, or
fold a rank-0 amendment.

The authority basis is a **human Board act** under the human-approval carve-out at
`CLAUDE.md:139–140`, **not** the rank of the instrument recording it. A rank-1 ADR is subordinate to
rank 0 (`00_AUTHORITY_MAP.md:15`, *"Architecture is supreme. Higher rank overrides lower"*) and
cannot of itself confer competence over rank-0 change; rank-1 status secures only
immutability-to-skills (Review-A **M-7**).

Owner-as-human-Board precedent, referenced not coined: `ADR-024…:3`, `:18`.

Conversational approval authorizes **drafting only**; the binding act is Board approval of the
artifact.

### RZ-3 · Route — base re-freeze by complete re-issue

```
<base vN>  as amended by  <amendment instrument>  re-issued as  <base vN+1>
```

```
Board approval
  → amendment applied (Existing Text / Amendment Text grammar — Doc-4C_PassA_Patch_v1.0.1.md:38)
  → base re-issued COMPLETE at the next unused label
  → re-frozen via a Freeze Certification block (Doc-4D_Structure_Freeze_Gate_v1.0.md:183–191)
  → 00_AUTHORITY_MAP.md points at the new version
  → prior version historical, never concurrent authority
```

Normative posture:

- **No concurrent rank-0 canon.**
- **No permanent corrective overlays for rank 0.**
- **No "latest file wins."**
- **No inference of authority from filenames or version numbers** — the Authority Map is the only
  place that says which version is active.
- **Canonical amendments produce a complete re-issued version**, never a partial diff carried
  alongside.

The mechanism extends the corpus's established controlled-document principle **by analogy**:
material canonical changes are issued through a new version rather than silently mutating the
previously certified artifact (`Master…FINAL.md:284`, `:1194` — business-document scope, §1.1).

### RZ-4 · The superseded version — no reciprocal edit

- The superseded file is preserved **byte-for-byte as an unchanged historical artifact**. It is
  **never edited**, including to add a back-pointer.
- The **new** document carries `Supersedes: <old document>` in its header (`Doc-2_…_v1.0.2.md:9`
  pattern).
- The **authority registry** (`00_AUTHORITY_MAP.md`) records the old version historical and the new
  version active.

v1.0 required an append-only `Superseded by` pointer in the superseded file. **Struck** — appending
is a byte-level edit of a FROZEN document, the act adjacent to the Red-Flag item *"Modify a FROZEN
document"*, and it contradicted the same clause's own "never edited" and the `PROVENANCE` definition
*"never reopened"* (`00_AUTHORITY_MAP.md:45`). Its sole precedent was a `governanceReviews/` board
record with a **pre-provisioned** row; no `generatedDocs/` frozen document has one (Review-A
**M-5**).

⚠️ **Open dependency:** `00_AUTHORITY_MAP.md:39–45` has **no authority level meaning "superseded
canonical base."** `PROVENANCE` does not fit — it is defined as *"Lifecycle record
(reviews/patches/audits)"*, which a superseded canonical base is not (Review-A **m-10**). This
instrument does **not** silently repurpose it; the gap is carried at §8 RZ-O2.

### RZ-5 · Precedence — scoped

For documents amended under RZ-3 the precedence question **does not arise**: at any moment exactly
one version of that document is authoritative.

**This scoping is prospective only.** It makes no claim about the existing `effective =` corpus,
where G-1 is **OPEN** (§4). No general "latest overlay wins" rule is coined, here or by implication.

### RZ-6 · Registration

**Normative — the single binding duty:**

1. `00_AUTHORITY_MAP.md` — the base row's Version and Notes updated to the re-issued version; the
   superseded version recorded as historical.

**Informative — Non-Normative** (operational hygiene; a rank-1 ADR does not make normative duties
out of non-authoritative or draft artifacts — Review-A **M-8**):

2. `CORPUS_INDEX.md` file map updated.
3. Any escalation handle the amendment closes is updated in `esc_registry.md` — itself *"DRAFT v0.3
   — non-authoritative companion"* (`:4`). Where a handle's scope is only partly addressed, the
   unaddressed part should retain an explicit carve-out rather than the handle being flipped whole.
   *(Its columns are `Handle | Scope / gap | Interim presentation | Channel` — there is no status
   column; Review-A **m-7**.)*
4. Non-authoritative mirrors that restate the amended text — `CLAUDE.md`, `README.md`,
   `project_details.md`, `REPOSITORY_STRUCTURE.md`, requirement docs — are synchronized (§7.3).

### RZ-7 · How a consumer determines the active version

Unchanged and referenced, not restated: `00_AUTHORITY_MAP.md` is the status SSoT
(`CLAUDE.md:167–168`), read with `CORPUS_INDEX.md` and, for multi-file documents, the `effective = …`
expression and the `*_SERIES_FROZEN_*` manifest. A rank-0 amendment adds no new resolution concept —
it only guarantees the expression resolves to **one** version of the amended document.

### RZ-8 · Version labels

Two rules, and no more:

1. **Use the next unused label.** Determined by sweeping `00_AUTHORITY_MAP.md` **and**
   `generatedDocs/` on disk — the map alone is insufficient, as the `Doc-4D` v1.0.1 double-issue
   demonstrates (`Doc-4D_PassA_Patch_v1.0.1.md` and `Doc-4D_PassB_Patch_v1.0.1.md` both exist).
2. **Never reuse a previously issued label.**

**No versioning scheme is defined.** Patch-vs-major classification is **not** decided here and needs
no decision for this mechanism to work; it is carried at §8 RZ-O1 for a deliberate corpus-versioning
policy if one is ever authored. v1.0's supporting citation for that gap is withdrawn as out of scope
(§2).

---

## 6. Procedure

| # | Step | Gate |
|---|---|---|
| 1 | Amendment instrument drafted: quotes *Existing Text* verbatim, gives *Amendment Text*, and records the **RZ-1 negative test** | admissibility |
| 2 | **Review-A** — independent; author never self-reviews | findings raised, not ruled |
| 3 | Board adjudicates each finding (four-question gate, `CLAUDE.md:233–238`) | Raise ≠ Accept |
| 4 | **Review-B** — independent | — |
| 5 | Verification: every *Existing Text* anchor matches the base **verbatim** (`Doc-4D_Structure_Freeze_Gate_v1.0.md:12`) **and** an independent reviewer confirms the RZ-1 negative test | must PASS |
| 6 | **Human Board approval** (RZ-2) | rank-0 act |
| 7 | Base re-issued complete + re-frozen with a Freeze Certification block (RZ-3) | **0 · 0 · 0** (`CLAUDE.md:225`) |
| 8 | Registration — RZ-6.1 normative; RZ-6.2–4 informative | one act |

Steps 2–5 reuse the corpus's existing chain (`00_AUTHORITY_MAP.md:65`); only the step-5 negative-test
confirmation is new.

---

## 7. Non-goals

### 7.1 This instrument does not

- Apply to anything below rank 0, or to any existing overlay (§4).
- Relax a superior rule — there is none to relax (§1.4).
- Grant any skill authority over ranks 0–1.
- Create a standing permission to relabel, re-word or re-key frozen content. **Every rank-0
  amendment is a discrete Board act.**
- Coin a precedence rule, a version scheme, an authority level, or a Board definition (§3).

### 7.2 It does not reconcile the legacy corpus

Restated because it is the most likely misreading: **ADR-027 confers no reading, tiebreak or
precedence on any existing base+patch set.** A future reconciliation instrument owns that (§4).

### 7.3 `CLAUDE.md` is downstream synchronization, not authority

Because `CLAUDE.md` is NON-AUTHORITATIVE (`00_AUTHORITY_MAP.md:216`), ADR-027's validity does **not**
depend on patching it. Once ADR-027 is accepted, `CLAUDE.md §11` is updated **separately** so
contributor instructions do not contradict the authoritative mechanism. That update is
**synchronization, not part of ADR-027's authority chain**, and is not a gate on this instrument.

*(Observed, informative: the mirror duty is already imperfectly met — `CLAUDE.md:162` records Doc-2
at **v1.0.3** while `00_AUTHORITY_MAP.md:55` records **v1.0.10**.)*

---

## 8. Open items — carried, not closed

| ID | Item |
|---|---|
| **G-1** | Legacy base/patch precedence — **OPEN**, separate reconciliation instrument (§4). |
| **RZ-O1** | Patch-vs-major increment criterion undefined. No corpus rule found; the v1.0 citation for this was out of scope and is withdrawn. Needs a deliberate corpus-versioning policy or nothing at all. |
| **RZ-O2** | The Authority Map legend (`:39–45`) defines five levels, but **at least two more are in live use and undefined**: `APPROVED` (`:59, 64, 65, 74`) and `RATIFIED` (`:76, 77`). **RZ-4 additionally needs a level for "superseded canonical base," which does not exist.** Separate Authority Map correction; ADR-027 does not define them. |
| **RZ-O3** | "Architecture Board" appears in 400+ files with **no definition of composition or authority**; the nearest is a per-gate role roster (`Architecture_Freeze_Reconfirmation_v1.0.md:9`). Separate governance-definition work. RZ-2 therefore authorizes by reference to existing precedent, coining no definition. |
| **RZ-O4** | `Architecture_Freeze_Reconfirmation_v1.0.md:104` authorized a re-issue into the Architecture file that `:18` shows was never executed. ⚠️ *Owner direction, pre-review:* **historical authorization only — revalidation required before execution.** Not a live warrant, not discharged here; any execution re-enters at §6 step 1. |

---

## 9. Approval block

| Gate | Status |
|---|---|
| Review-A (independent) — v1.0 | ✅ run 2026-07-21 → 🟠 REVISION REQUIRED (1·9·10·1·3) |
| Revision v1.0 → v1.1 | ✅ this document |
| **Review-A (fresh, independent reviewer)** — v1.1 | ☐ not run |
| Review-B (independent) | ☐ not run |
| Human Architecture Board — mechanism approval | ☐ not granted |
| Fold as `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md` + `00_AUTHORITY_MAP.md` registration | ☐ blocked |
| RZ-O2 Authority Map legend correction (RZ-4 dependency) | ☐ separate instrument |
| `CLAUDE.md §11` synchronization | ☐ separate, downstream — **not a gate on this instrument** |

Freeze/merge gate (`CLAUDE.md:225`): **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** before fold.

*End of Governance_RankZero_Amendment_Mechanism_v1.1 (PROPOSED) — first-instance rule for future
rank-0 canonical amendment: admissibility with a recorded negative test, human-Board authorization,
base re-freeze by complete re-issue, unedited superseded artifacts, Authority-Map registration, and
version-label non-reuse. Coins no precedence rule, no version scheme, no authority level, no Board
definition. Does not reconcile the legacy overlay corpus — G-1 remains OPEN. DRAFT — awaits HUMAN
approval; not folded by AI.*
