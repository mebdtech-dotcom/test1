# Governance_RankZero_Amendment_Mechanism_v1.2_PROPOSAL.md
### → intended fold form **ADR-027 — Rank-Zero Amendment Mechanism**

> **STATUS: DRAFT — AWAITS HUMAN ARCHITECTURE BOARD APPROVAL.** Architecture-affecting under
> `CLAUDE.md:149`; approvable only by a human Board, never by a skill (`CLAUDE.md:139–140`).
>
> **What this instrument is.** The Master Architecture and ADR Compendium demonstrate an approved
> **consolidation-and-reissue practice** in which reconciliation rulings were carried into a complete
> canonical artifact and prior approved artifacts were superseded. The corpus does not, however,
> state a complete **prospective procedure** for initiating, reviewing, executing, registering and
> activating future amendments to an already-frozen rank-0 canonical document. **ADR-027 codifies
> that demonstrated practice** — without creating a generic latest-overlay-wins rule and without
> retroactively resolving legacy effective-patch sets.
>
> **The v1.1 "first-instance" framing is WITHDRAWN** (Board ruling 2026-07-21 §5.2). Ranks 0 and 1
> are **not** silent: they contain consolidation, reconciliation, supersession and label-reservation
> precedent (§1.1). v1.1's *"ranks 0 and 1 are SILENT"* finding is **struck**.
>
> **Scope boundary — read this before citing it:** ADR-027 governs **future rank-0 canonical
> amendments only.** It does **not** reconcile, interpret, or determine precedence among the
> existing `effective =` base+patch corpus (§4, G-1).
>
> **Effectiveness is gated.** Approval alone does not activate this instrument; it becomes effective
> only when the §7.3 synchronization bundle is complete (Board ruling §5.6).
>
> **Revision v1.1 → v1.2** against Review-A round 2 (🟠 REVISION REQUIRED — 1 BLOCKER · 9 MAJOR ·
> 7 MINOR · 2 NIT · 3 OBS) **and the Board adjudication recorded at
> `governanceReviews/ReviewA_Record_RankZero_Amendment_Mechanism_v1.1.md` §5.** Rounds 1–2 records
> retained on disk. Prior drafts are retained, not deleted, so the diff stays auditable.

## Status

| Field | Value |
|---|---|
| Instrument type | Governance rule (mechanism) — **codification of a demonstrated corpus practice**, not a first-instance rule |
| Intended fold form | **ADR-027** — `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md`, carried alongside the unedited `ADR_Compendium_v1.md` per the ADR-021/024/025 precedent (`00_AUTHORITY_MAP.md:54`). ⚠️ **Owner direction, pre-review, non-folding** — it selected the drafting route; it did **not** constitute review acceptance, fold approval, or canonical authority. |
| Authority basis | A **human Board act** under the human-approval carve-out at `CLAUDE.md:139–140`. Rank-1 status confers immutability-to-skills; it does **not** confer competence over rank 0 (RZ-2). |
| Scope | **How** an already-frozen rank-0 CANONICAL document may be amended in future, when the act changes active rank-0 meaning (RZ-1). |
| Explicitly out of scope | The legacy `effective =` overlay corpus (§4) · any content of any pending amendment · the composition of the Architecture Board · a version-numbering scheme · the undefined authority levels. |
| Rank 0/1 survey | Performed 2026-07-21, **expanded at v1.2** (§1.1). Bounded finding, not an absence claim (§1.5). |
| Origin | Review-A MAJ-5 on the vendor-type register amendment → structural split (owner direction 2026-07-21) |

---

## 1. Problem

### 1.1 What ranks 0 and 1 actually contain — the expanded survey

v1.1 surveyed four rows and concluded *"SILENT."* Review-A round 2 **B-1** proved that conclusion
unsupportable; the Board accepted it. The survey below is expanded per **M-9** to include ADR-024,
ADR-025, ADR-010, the Master supersession clauses, and the Compendium's Board log. Every anchor was
re-read from source on 2026-07-21.

**Rank 0 — `Master_System_Architecture_v1.0_FINAL.md` (CANONICAL):**

| Anchor | Text | Bearing |
|---|---|---|
| `:9` | `Supersedes \| Master System Architecture Draft v0.1; ADR Compendium v1 (for reading purposes); Architecture Closure Package v0.3.2 (for reading purposes)` | **Rank 0 is itself a consolidated re-issue that superseded predecessors.** The `Supersedes` header is rank-0 practice, not an invention of this instrument. |
| `:1431` | *"**Consolidation rulings carried into this document** (from the architecture review of the frozen corpus): …"* — seven enumerated reconciliations | **Reconciliation rulings carried into a complete canonical artifact** — the exact shape RZ-3 codifies, demonstrated at rank 0. |
| `:1437` | *"All prior drafts, compendia, and closure packages are **superseded for reading purposes** by this document."* | Rank-0 supersession language, scoped *for reading purposes*. |
| `:284` (Invariant 8) | *"Controlled documents are versioned, never edited in place."* | **Analogy.** `:1186–1196` scopes version-controlled documents to product specifications, procurement documents and company documents — business records. See §1.4 on why the instrument does not stake its case here. |
| `:1194` | *"**Never overwrite** — v1 → v2 → v3; never edit in place. Revisions are labeled."* | Same business-document scope. |
| `:12` | *"All architecture decisions recorded here are final and frozen … the agent must stop and flag the conflict rather than work around it."* | Prescribes escalation, not an amendment procedure. (Round-2 **O-1**.) |

**Rank 1 — `ADR_Compendium_v1.md` and the carried ADRs (FROZEN):**

| Anchor | Text | Bearing |
|---|---|---|
| `ADR_Compendium_v1.md:20` | *"Nothing in this compendium introduces a new decision. **Where two approved texts conflicted, the later amendment wins and the reconciliation is recorded.**"* | **A rank-1 tiebreak — scope-limited by Board ruling (§1.2).** |
| `ADR_Compendium_v1.md:50–59` §B — eleven **Modify / Modify (reconcile) / Modify (editorial) / Keep / Flag / Reject** verdicts on *approved* texts | A rank-1 record of a Board performing **non-additive modification of authoritative decisions during a consolidated re-issue**. |
| `ADR_Compendium_v1.md:57` (§B item 9) | *"ADR-019 absent from corpus … **Number reserved. Do not backfill.**"* | Rank-1 precedent for **label reservation and non-reuse** — the support RZ-8 rests on (§RZ-8). |
| `ADR_Compendium_v1.md:15, :17, :209, :265` | Status Approved/**Superseded**; *"so amendment provenance survives"*; in-band *"Superseded marker: ADR-005 v1 … Do not implement against v1"* | Rank-1 supersession vocabulary **and in-band marking practice** — bears directly on RZ-4 (§RZ-4). |
| `ADR-010` (`ADR_Compendium_v1.md:495–523`) — *"Document Versioning & Specification Control"* | *"All controlled **business** documents support versioning. **No document is overwritten.**"*; `:506–508` enumerates Product Specifications / Procurement Documents / Company Documents | **The most on-point rank-1 versioning ADR.** Its scope is controlled *business* documents — named exactly, per round-2 **m-3**. Corroborates Invariant 8's scoping. |
| `ADR-024_Canonical_Vendor_Subdomain_URLs.md:44–46` | *"Because **the corpus is silent**, this is an **additive authoring** decision — not an override of any frozen clause."* | **The identical rhetorical move, resolved additively.** Both a structural precedent and the strongest counter-argument to a non-additive route; surfaced here rather than cited only for owner-as-Board (round-2 **M-9**). |
| `ADR-025…:57–59` | *"Future resource-specific URL decisions SHALL conform to the principles of this ADR **unless explicitly superseded by a later Board decision**"* | Rank-1 contemplation of **explicit supersession by Board act** — supersession is a recognized rank-1 mechanism, not a coinage. |
| `ADR_Compendium_v1.md:9` | Compendium supersedes individual ADRs **for reading** | Reading precedence between ADR forms. |
| `ADR_Compendium_v1.md:511` | *"never overwrite"* | RFQ-scoped (not, as v1.1 implied, the whole of the rank-1 versioning position — see ADR-010 above). |

### 1.2 The `ADR_Compendium_v1.md:20` ruling — scope-limited (Board, 2026-07-21)

`:20` generalizes **only to the approved Architecture/ADR consolidation context.** It establishes:

> When approved texts conflict during an authorized consolidation, the later approved amendment
> controls and the reconciliation is recorded.

It does **not** establish *"any later patch automatically overrides any earlier frozen base."* The
broader reading would leave undefined: what *"later"* means · whether the amendment must be
Board-approved · whether rank must match · whether an unregistered patch qualifies · how overlapping
amendments are ordered · whether the rule extends beyond the consolidation set.

```
ADR Compendium :20
  = authoritative consolidation precedent
  ≠ generic latest-overlay-wins mechanism
```

**This instrument coins no latest-overlay-wins rule and relies on none.**

### 1.3 The change shapes that require this route

| Shape | Why an additive overlay is inadequate |
|---|---|
| **Correction of normative canonical text** | An overlay asserting the correct proposition leaves the base asserting the incorrect one; both remain live. |
| **Rename / re-key** | The superseded identifier remains in the base; base and overlay then disagree about identity. |
| **Removal** | Nothing additive can un-say frozen text. |

Each produces two simultaneously authoritative texts contradicting each other on one proposition.
**Within the approved consolidation context, rank 1 supplies a tiebreak (§1.2); outside that context,
the survey in §1.1 identified no rule ordering a frozen base against a later overlay** — which is
precisely why G-1 remains open (§4) rather than being answered here in either direction.

### 1.4 Where the additive-only instruction lives — and what that does and does not mean

| Statement | Location | Authority level |
|---|---|---|
| *"changed only by additive patch + (rank 0–1) human approval"* | `00_AUTHORITY_MAP.md:42` (**FROZEN** legend row; the rank-0 target is **CANONICAL** at `:41`, which carries no amendment rule — round-2 **m-4**) | **NON-AUTHORITATIVE** (`:187`) |
| *"Never edit a FROZEN document. Propose additive patches only."* | `CLAUDE.md:192` | **NON-AUTHORITATIVE** (`00_AUTHORITY_MAP.md:216`) |
| *"Changing [ranks 0–1] requires an **additive** architecture patch with human approval"* | `CLAUDE.md:139–140`; mirrored `00_AUTHORITY_MAP.md:30–31` | **NON-AUTHORITATIVE** |

The word **"additive"** is quoted in full, not elided. Two corrections to v1.1's handling:

1. **"Non-authoritative" ≠ "uncontrolled."** `CLAUDE.md:3–5` self-stamps **FROZEN v1.3** — *"changes
   require an additive patch + version bump"* — and `Governance_Freeze_v1.0.md:8` covers *"the
   repository governance/orientation layer only,"* which is exactly the layer this instrument
   changes. v1.1 called that update *"not a gate."* **That is reversed: it is now a mandatory
   effectiveness gate (§7.3).**
2. This instrument does not claim the authoritative ranks are silent. It claims — bounded, §1.5 —
   that they demonstrate the practice without stating a complete prospective procedure.

### 1.5 Bounded finding (mandatory form — Board method ruling §5.7)

> **Within the sources enumerated in §1.1, no complete prospective procedure was identified for
> initiating, reviewing, executing, registering and activating an amendment to an already-frozen
> rank-0 canonical document.**

This is deliberately *not* an assertion of silence, absence, no-precedent, or first-instance status.
Per the Board's method-level ruling, such terms may not be used unless the artifact carries a full
rank-0 conceptual sweep, a full rank-1 conceptual sweep, synonym and mechanism searches, evidence
both supporting **and contradicting** the claim, an explicit sweep boundary, and independent
verification of the negative. **Sweep boundary for §1.1:** `Master_System_Architecture_v1.0_FINAL.md`,
`ADR_Compendium_v1.md` (including the carried ADR-010/-024/-025 texts). Documents below rank 1 were
surveyed for *vocabulary and practice* (§2), never for authority.

---

## 2. Evidence — what already exists (referenced, never restated, `CLAUDE.md:193`)

**The authority-level column is load-bearing.** Nothing below rank 1 authorizes anything in §5;
lower-level rows are cited as **existing vocabulary and practice to reuse**, never as authority.

| Existing item | Location | Authority level |
|---|---|---|
| Rank-0 consolidated re-issue: `Supersedes` header · rulings carried in · predecessors superseded | `Master…FINAL.md:9`, `:1431`, `:1437` | **rank 0 — CANONICAL** |
| Controlled **business** documents versioned, never edited in place | `Master…FINAL.md:284`, `:1186–1196` | **rank 0 — CANONICAL** (analogy) |
| Consolidation tiebreak, scope-limited (§1.2) | `ADR_Compendium_v1.md:20` | **rank 1 — FROZEN** |
| Board log: Modify / Modify (reconcile) / Keep / Flag / Reject on approved texts | `ADR_Compendium_v1.md:50–59` | **rank 1 — FROZEN** |
| Label reserved, **do not backfill** | `ADR_Compendium_v1.md:57` | **rank 1 — FROZEN** |
| Supersession vocabulary + in-band `Superseded marker … Do not implement against v1` | `ADR_Compendium_v1.md:15, :17, :209, :265` | **rank 1 — FROZEN** |
| Controlled **business** document versioning ADR | `ADR-010` (`ADR_Compendium_v1.md:495–523`) | **rank 1 — FROZEN** (scope: business docs) |
| Explicit supersession by a later Board decision | `ADR-025…:57–59` | **rank 1 — FROZEN** |
| Corpus-silence resolved **additively** (counter-precedent, stated as such) | `ADR-024…:44–46` | **rank 1 — FROZEN** |
| Owner acting as the human Board | `ADR-024…:3`, `:18` | **rank 1 — FROZEN** |
| Authority levels `CANONICAL`/`FROZEN`/`ACTIVE`/`NON-AUTHORITATIVE`/`PROVENANCE` | `00_AUTHORITY_MAP.md:39–45` | NON-AUTHORITATIVE |
| The document wins over the map; the map is patched | `00_AUTHORITY_MAP.md:7–9` | NON-AUTHORITATIVE |
| Reference-never-restate · Verify before delivering · Flag-and-Halt | `CLAUDE.md:193`, `:197`, `:198` | NON-AUTHORITATIVE |
| Raise ≠ Accept (`:228`) + four-question gate (`:233–237`) | `CLAUDE.md` | NON-AUTHORITATIVE |
| Freeze gate **0 · 0 · 0** | `CLAUDE.md:225` | NON-AUTHORITATIVE |
| Freeze Certification block vocabulary | `Doc-4D_Structure_Freeze_Gate_v1.0.md:183–191` | PROVENANCE |
| *Existing Text* anchor must match the base **verbatim** | `Doc-4D_Structure_Freeze_Gate_v1.0.md:12` | PROVENANCE |
| *"as amended by … re-issued as …"* phrasing | `Doc-4D_Structure_Freeze_Gate_v1.0.md:187`; `Doc-4E_…:92` | PROVENANCE — ⚠️ both are **pre-freeze consolidations**, not amendment of an already-frozen base |
| Existing-Text-Reference / Amendment-Text patch grammar | `Doc-4C_PassA_Patch_v1.0.1.md:38` | ⚠️ **Authority-Map-unregistered**; appears only at `CORPUS_INDEX.md:65` as Doc-4C authoring history. **Cited as drafting vocabulary only — NOT normative authority** (round-2 **M-4**). Term is *"Existing Text Reference"* (round-2 **n-2**). |
| `Supersedes` header on a consolidated re-issue (lower-rank instances) | `Doc-2_…_v1.0.2.md:9`; `Doc-3_…_v1.0.1.md:9` | FROZEN |
| Review chain A → dispositions → verification → fold | `00_AUTHORITY_MAP.md:65` — ⚠️ **a single patch row**, cited as an instance of the practice, not as its charter (round-2 **m-5**) | NON-AUTHORITATIVE |
| ADR carried alongside the unedited Compendium | `00_AUTHORITY_MAP.md:54`; `ADR-024…:3–12` | NON-AUTHORITATIVE / FROZEN |

**Withdrawn or demoted** (carried forward from v1.1, unchanged): `Doc-5A_Content_v1.0_Pass10.md:59`
removed (API-surface identifier, not document versioning; `:61` binds it expressly) ·
`BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md:18` removed · `Doc-5J_…:57` demoted to practice-evidence ·
`BOARD-PACKET-A7R-…_v0.1.md:21` demoted to corroboration · `Governance_Freeze_v1.0.md` noted at its
true path (repo root), NON-AUTHORITATIVE, unregistered — but see §7.3: it **governs the layer this
instrument changes**, which v1.1 failed to notice.

### 2.1 `Architecture_Freeze_Reconfirmation_v1.0.md` — stated in both directions

**For:** `:18` calls re-issue *"the standard consolidated state"*; `:104` states the verified delta
*"is **re-issued** into the Architecture file under change management (mechanical application of the
already-verified patch; **no further review required**)."*

**Against:** (a) it was **never executed** — `:18` records the frozen baseline as *"pre-patch
Architecture + the verified CD-MA-1 patch"*, and `Master…FINAL.md:1004–1015` still holds the
pre-patch §15.3 rows; (b) the CD-MA-1 delta was **purely additive**, so it is not a worked example of
the correction / rename / removal shapes. It supplies **vocabulary and a ruled-once posture** — not
authority.

---

## 3. What is existing practice, and what this instrument standardizes

Rebuilt per round-2 **M-8** and Board §5.4. The two columns are kept apart deliberately: conflating
them is what produced v1.1's first-instance error.

### 3.1 Existing precedent — demonstrated in the corpus, not coined here

| Practice | Demonstrated at |
|---|---|
| Consolidated re-issue of a canonical artifact | `Master…FINAL.md:9`, `:1437` |
| Reconciliation of conflicting **approved** texts, carried into the new artifact | `Master…FINAL.md:1431`; `ADR_Compendium_v1.md:20`, `:50–59` |
| Board **modification** decisions on approved texts (Modify / Modify-reconcile) | `ADR_Compendium_v1.md:50–59` |
| Supersession of prior artifacts, with provenance preserved | `Master…FINAL.md:9`; `ADR_Compendium_v1.md:15`, `:209`; `ADR-025…:57–59` |
| Reserved-label **non-backfill** | `ADR_Compendium_v1.md:57` |

### 3.2 New procedural standardization — what ADR-027 actually adds

| Added | Where |
|---|---|
| **Trigger** — the semantic admissibility rule | RZ-1 |
| **Review chain** — independent A, Board adjudication, independent B | §6 |
| **Execution gates** — verbatim anchor verification; 0 · 0 · 0 freeze gate | §6 |
| **Activation conditions** — the effectiveness bundle | §7.3, §9 |
| **Registry rules** — adoption record + synchronized pointer | RZ-4, RZ-6 |
| **Immutable historical artifact rule** — the superseded file is never mutated | RZ-4 |
| **Legacy-scope exclusion** — expressly outside this instrument | §4, §7.2 |
| **Effectiveness synchronization** — approval ≠ activation | §7.3 |
| **Document version-label non-reuse**, and *next unused label* as the selection rule | RZ-8 |

**Not coined, expressly:** a base/patch precedence rule (§4) · a latest-overlay-wins rule (§1.2) · a
version-numbering or patch-vs-major scheme (RZ-8) · the `APPROVED` / `RATIFIED` authority levels
(§8) · the composition of the Architecture Board (§8) · any change to how existing overlays are read
(§4).

---

## 4. What this instrument does NOT resolve — the legacy overlay corpus

**ADR-027 does not reconcile the existing overlay corpus.** It does not interpret, tiebreak, or
retroactively determine precedence among existing base + patch combinations. It applies **only to
future rank-0 canonical amendments**.

The legacy condition is recorded so it is not mistaken for resolved. **Per Board ruling §5.4 (M-3),
no characterization of these folds as "correctly additive," "reconciled," or otherwise adjudicated
is made or implied — they are listed as evidence that the question is open, nothing more:**

| Evidence | Location |
|---|---|
| `Doc-6C_Patch_v1.0.1` corrects its frozen base's permission-slug count **45 → 43**, base untouched | `00_AUTHORITY_MAP.md:123` |
| The same count later reads **46 → 47** (round-2 **m-1**: `:121` supports this leg; the fuller "43 → 45 → 46 → 47" chain requires per-patch citation and is not asserted here) | `00_AUTHORITY_MAP.md:121` |
| `Doc-5D_Patch_v1.0.1` carries *"a conformance correction"* | `00_AUTHORITY_MAP.md:86` |
| `Doc-4M v1.0.1/v1.0.2` index corrections, base untouched | `00_AUTHORITY_MAP.md:72` |

> ### G-1 — Legacy base/patch precedence
>
> **Status: OPEN, PARTIALLY INFORMED.**
>
> ```
> Known:    The Architecture/ADR consolidation resolved conflicting approved texts
>           by applying the later amendment and recording the reconciliation.
> Unknown:  Whether and how that rule governs later "effective =" base-plus-patch
>           sets such as Doc-6C.
> ADR-027:  Does not resolve those legacy sets retroactively.
> ```
>
> **Resolution vehicle:** a separate, future legacy reconciliation instrument.

**Board rationale of record for not generalizing overlays:** reconstructing authority from a base
plus a chain of overlays is harder for engineers, reviewers and AI agents than reading one complete
current version. Adopting corrective overlays as the *future* model because legacy debt exists would
convert legacy ambiguity into a governance model.

The future reconciliation instrument's remit (recorded, not authorized here): inventory every frozen
base + effective patch set · separate genuine contradictions from additive disjoint extensions ·
define the authoritative effective reading per legacy set · consolidate contradictory sets into a
complete re-issued canonical version · retire the ambiguity once consolidated.

---

## 5. Mechanism — Rank-0 Amendment by Base Re-Freeze

### RZ-1 · Admissibility — a semantic trigger

**v1.1's four-condition test is DELETED** (Board §5.4/§5.5, round-2 **M-2**). It turned on proving a
universal negative — *"no additive formulation exists"* — which is practically impossible, since
nearly any correction can be expressed as an overriding overlay.

**ADR-027 applies when an approved Board act changes active rank-0 meaning through:**

```
replacement · removal · renaming · re-keying · correction · reconciliation · consolidation
```

**ADR-027 does not apply to:**

```
editorial corrections that do not change canonical meaning
non-authoritative guidance
derived indexes corrected toward an unchanged higher authority
lower-rank implementation documents
legacy overlay reconciliation unless separately authorized
```

**The decisive question:**

```
Does the act change the active meaning of rank-0 canon?
```

**Not:**

```
Could somebody technically express it as an additive patch?
```

The editorial exclusion answers round-2 **m-2** directly: a typo that does not change canonical
meaning is out of scope and does not trigger a re-issue. Additive patching remains the **default and
the overwhelming norm** for everything this trigger does not reach.

### RZ-2 · Authorization

Human **Architecture Board** only. No skill — including the Virtual CTO — may authorize, execute, or
fold a rank-0 amendment.

The authority basis is a **human Board act** under the human-approval carve-out at
`CLAUDE.md:139–140`, **not** the rank of the instrument recording it. A rank-1 ADR is subordinate to
rank 0 (`00_AUTHORITY_MAP.md:15`) and cannot of itself confer competence over rank-0 change; rank-1
status secures only immutability-to-skills.

Owner-as-human-Board precedent, referenced not coined: `ADR-024…:3`, `:18`. Conversational approval
authorizes **drafting only**; the binding act is Board approval of the artifact. *(Enumerated in
§3.2 as procedural standardization, per round-2 **M-8** — it narrows `ADR-024:18` and is therefore
declared, not smuggled.)*

### RZ-3 · Route — base re-freeze by complete re-issue

```
<base vN>  as amended by  <amendment instrument>  re-issued as  <base vN+1>
```

```
Board approval
  → amendment applied (Existing Text Reference / Amendment Text drafting grammar)
  → base re-issued COMPLETE at the next unused label
  → re-frozen via a Freeze Certification block
  → adoption record executed (RZ-4)
  → registries synchronized to point at the new version
  → prior version historical, never concurrent authority
```

Normative posture:

- **No concurrent rank-0 canon.**
- **No permanent corrective overlays for rank 0.**
- **No "latest file wins."**
- **Canonical amendments produce a complete re-issued version**, never a partial diff carried
  alongside.
- **Authority is determined by the documents themselves, read with the adoption record.** The
  Authority Map is a **synchronized pointer**, not the source of canonical authority — per
  `00_AUTHORITY_MAP.md:7–9`, *"If a status here disagrees with the actual document, the document
  wins and this map is patched."* v1.1's *"the Authority Map is the only place that says which
  version is active"* is **struck** (round-2 **M-1**).

This route **follows the rank-0 precedent** at `Master…FINAL.md:9`/`:1431`/`:1437` — a complete
canonical artifact carrying reconciliation rulings and superseding its predecessors — rather than
extending business-document versioning by analogy. *(Round-2 **O-2**: staking the case on Invariant
8 was unnecessary; the rank-0 consolidation precedent is stronger and directly on point.)*

### RZ-4 · Supersession — adoption record, unmutated history

Per Board §5.4 (**M-6**), supersession does **not** depend on an Authority Map status value:

1. **The new canonical artifact** carries `Supersedes: <prior artifact>` in its header
   (`Master…FINAL.md:9` pattern, rank-0 precedent).
2. **An authoritative adoption / re-issue record** is executed, stating: old = **historical**,
   new = **active**, the **effective date**, and the **verification result**. This record — not a
   registry legend value — is what establishes the transition.
3. **The Authority Map is synchronized** as a pointer to the active version.
4. **The superseded file is preserved byte-for-byte as an unchanged historical artifact.** It is
   never edited, including to add a back-pointer.

This removes v1.1's dependency on a nonexistent legend value (round-2 **M-6**), so RZ-4 no longer
carries an unmet registry dependency into the fold gate. **RZ-O2 remains open as Authority Map
hygiene, but is no longer a blocking dependency of this clause.**

*Disclosed, per round-2 **m-6**:* rank-1 practice at `ADR_Compendium_v1.md:209` **does** use an
in-band *"Superseded marker … Do not implement against v1."* This instrument nonetheless forbids
mutating a superseded rank-0 artifact, because appending is a byte-level edit of a FROZEN document
and adjacent to the Red-Flag item *"Modify a FROZEN document."* The adoption record (item 2) supplies
the reader-facing signal that the in-band marker would otherwise carry. *Also disclosed:* this
instrument's own drafts in `governanceReviews/` were superseded by in-place banner edits — those are
non-corpus working drafts outside RZ-4's rank-0 scope, but the practice is recorded rather than
concealed.

### RZ-5 · Precedence — scoped

For documents amended under RZ-3, the precedence question **does not arise**: at any moment exactly
one version of that document is authoritative.

**Prospective only.** It makes no claim about the existing `effective =` corpus, where G-1 is
**OPEN, PARTIALLY INFORMED** (§4). No general latest-overlay-wins rule is coined, here or by
implication (§1.2).

### RZ-6 · Registration

**Normative — the binding duties:**

1. The **adoption record** (RZ-4.2) is executed as part of the same Board act.
2. `00_AUTHORITY_MAP.md` is **synchronized** to point at the re-issued version, and records the
   superseded version as historical.

**Informative — Non-Normative** (operational hygiene; a rank-1 ADR does not make normative duties out
of non-authoritative or draft artifacts):

3. `CORPUS_INDEX.md` file map updated.
4. Any escalation handle the amendment closes is updated in `esc_registry.md` — itself *"DRAFT v0.3
   — non-authoritative companion"* (`:4`); where a handle's scope is only partly addressed, the
   unaddressed part retains an explicit carve-out rather than the handle being flipped whole.
5. Non-authoritative mirrors that restate the amended text are synchronized — but note that for
   `CLAUDE.md` this is **not** merely hygiene; see §7.3.

### RZ-7 · How a consumer determines the active version

Referenced, not restated: the **document** is primary; `00_AUTHORITY_MAP.md` is the status pointer
(`CLAUDE.md:167–168`), read with `CORPUS_INDEX.md` and, for multi-file documents, the `effective = …`
expression and the `*_SERIES_FROZEN_*` manifest. A rank-0 amendment adds no new resolution concept —
it guarantees the expression resolves to **one** version of the amended document. *(Round-2 **O-4**:
`effective =` expressions and series manifests live outside the Authority Map, a further reason no
single registry can be the exclusive authority.)*

### RZ-8 · Version labels

Two rules, and no more:

1. **Use the next unused label**, determined by sweeping `00_AUTHORITY_MAP.md` **and**
   `generatedDocs/` on disk. **Independent support** (round-2 **M-5**): the Authority Map is not a
   complete index of issued labels — `Doc-4D_PassA_Patch_v1.0.1.md` and `Doc-4D_PassB_Patch_v1.0.1.md`
   both exist on disk and **neither is Authority-Map-registered**. *(v1.1's "double-issue" argument is
   **withdrawn**: verified headers show `Applies To: Doc-4D_Content_v1.0_PassA.md` and
   `…_PassB.md` — two different base documents, each correctly at its own v1.0.1. No label was
   issued twice.)*
2. **Never reuse a previously issued label.** Rank-1 precedent: `ADR_Compendium_v1.md:57` —
   *"Number reserved. Do not backfill."*

**No versioning scheme is defined.** Patch-vs-major classification is not decided here; carried at §8
RZ-O1.

---

## 6. Procedure

| # | Step | Gate |
|---|---|---|
| 1 | Amendment instrument drafted: quotes the *Existing Text Reference* verbatim and gives the *Amendment Text*; states which RZ-1 trigger term applies and why the act **changes active rank-0 meaning** | RZ-1 admissibility |
| 2 | **Review-A** — independent; author never self-reviews | findings raised, not ruled |
| 3 | Board adjudicates each finding (four-question gate, `CLAUDE.md:233–237`; Raise ≠ Accept at `:228` — round-2 **n-1**) | Raise ≠ Accept |
| 4 | **Review-B** — independent | — |
| 5 | Verification: every *Existing Text Reference* anchor matches the base **verbatim** (`Doc-4D_Structure_Freeze_Gate_v1.0.md:12`) | must PASS |
| 6 | **Human Board approval** (RZ-2) | rank-0 act |
| 7 | Base re-issued complete + re-frozen with a Freeze Certification block (RZ-3) | **0 · 0 · 0** (`CLAUDE.md:225`) |
| 8 | Adoption record + registry synchronization (RZ-4, RZ-6) | one act |
| 9 | **Effectiveness bundle complete** (§7.3) | activation |

Steps 2–5 reuse the corpus's existing review practice; the negative-test confirmation required by
v1.1 is **removed** with the test itself (RZ-1).

---

## 7. Non-goals and boundaries

### 7.1 This instrument does not

- Apply to anything below rank 0, or to any existing overlay (§4).
- Coin a precedence rule, a latest-overlay-wins rule, a version scheme, an authority level, or a
  Board definition (§3.2).
- Grant any skill authority over ranks 0–1.
- Create a standing permission to relabel, re-word or re-key frozen content. **Every rank-0
  amendment is a discrete Board act.**

### 7.2 It does not reconcile the legacy corpus

Restated because it is the most likely misreading: **ADR-027 confers no reading, tiebreak or
precedence on any existing base+patch set.** A future reconciliation instrument owns that (§4). **No
statement in this instrument may be cited as adjudicating any legacy fold.**

### 7.3 `CLAUDE.md` synchronization — a MANDATORY EFFECTIVENESS GATE

**v1.1 called this "not a gate." That is reversed** (Board §5.6, round-2 **M-7**).

*"Non-authoritative" does not mean uncontrolled.* `CLAUDE.md` is a **frozen operational control
surface**: it self-stamps FROZEN v1.3 requiring *"an additive patch + version bump"* (`:3–5`), and
`Governance_Freeze_v1.0.md:8` scopes the governance/orientation freeze to exactly the layer this
instrument changes. Folding ADR-027 while `CLAUDE.md:192` still reads *"Never edit a FROZEN
document"* would **manufacture a standing Flag-and-Halt for every contributor and AI agent.**

**ADR-027 may be reviewed and approved first, but does not become effective until the whole bundle
is complete:**

```
ADR-027 folded
CLAUDE.md additive patch
CLAUDE.md version bump
governance/orientation freeze procedure
Authority Map synchronization
required index synchronization
```

**Board-directed synchronized wording** for the `CLAUDE.md` Red-Flag / Working-Rules surface:

> Never edit a FROZEN document in place.
>
> A rank-0 canonical document may be superseded only through the Board-approved ADR-027
> amendment-and-reissue procedure. The superseded artifact remains unchanged.

This preserves the general prohibition while defining the controlled exception.

*(Observed, informative: the mirror duty is already imperfectly met — `CLAUDE.md:162` records Doc-2
at **v1.0.3** while `00_AUTHORITY_MAP.md:55` records **v1.0.10**.)*

### 7.4 Drafting control on absence claims (binding on future instruments)

Per the Board's method-level ruling (§5.7), **no governance artifact in this program may state
`SILENT`, `ABSENT`, `NO PRECEDENT`, or `FIRST-INSTANCE`** unless it carries all six of: a full rank-0
conceptual sweep · a full rank-1 conceptual sweep · synonym and mechanism searches · evidence
supporting **and contradicting** the claim · an explicit sweep boundary · independent verification of
the negative claim. Otherwise the bounded form is mandatory (§1.5).

---

## 8. Open items — carried, not closed

| ID | Item |
|---|---|
| **G-1** | Legacy base/patch precedence — **OPEN, PARTIALLY INFORMED** (§4). Separate reconciliation instrument. |
| **RZ-O1** | Patch-vs-major increment criterion undefined. Needs a deliberate corpus-versioning policy, or nothing at all. |
| **RZ-O2** | The Authority Map legend (`:39–45`) defines five levels; **`APPROVED` (`:59, 64, 65, 74`) and `RATIFIED` (`:76, 77`) are in live use and undefined.** Separate Authority Map correction. **No longer an RZ-4 dependency** — RZ-4 now rests on the adoption record, not a legend value. |
| **RZ-O3** | "Architecture Board" appears across the repo with no definition of composition or authority; nearest is a per-gate role roster (`Architecture_Freeze_Reconfirmation_v1.0.md:9`). RZ-2 authorizes by reference to existing precedent, coining no definition. |
| **RZ-O4** | `Architecture_Freeze_Reconfirmation_v1.0.md:104` authorized a re-issue that `:18` shows was never executed. ⚠️ **Historical authorization only — revalidation required before execution.** Any execution re-enters at §6 step 1. |
| **RZ-O5** | **Instrument 2 (vendor-type preset amendment) REMAINS PARKED.** When it unparks, the carried `Doc-4D` version premise must be **re-derived, not inherited** — round-2 **M-5** disproved the double-issue reasoning that underpinned it. |

---

## 9. Approval block

| Gate | Status |
|---|---|
| Review-A (independent) — v1.0 | ✅ 2026-07-21 → 🟠 REVISION REQUIRED (1·9·10·1·3) |
| Review-A (fresh independent reviewer) — v1.1 | ✅ 2026-07-21 → 🟠 REVISION REQUIRED (1·9·7·2·3) |
| **Board adjudication of the v1.1 record** | ✅ 2026-07-21 — `ReviewA_Record_RankZero_Amendment_Mechanism_v1.1.md` §5 |
| Revision v1.1 → v1.2 | ✅ this document |
| **Review-A (fresh, independent)** — v1.2 | ☐ not run |
| Review-B (independent) | ☐ not run |
| Human Architecture Board — mechanism approval | ☐ not granted |
| Fold as `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md` + Authority Map registration | ☐ blocked |
| **EFFECTIVENESS BUNDLE (§7.3) — `CLAUDE.md` patch + version bump + freeze procedure + registry/index synchronization** | ☐ **MANDATORY GATE — ADR-027 is not effective until complete** |
| RZ-O2 Authority Map legend correction | ☐ separate instrument — **no longer blocking** |

Freeze/merge gate (`CLAUDE.md:225`): **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** before fold.

*End of Governance_RankZero_Amendment_Mechanism_v1.2 (PROPOSED) — codification of a demonstrated
consolidation-and-reissue practice into a complete prospective procedure for future rank-0 canonical
amendment: a semantic admissibility trigger, human-Board authorization, base re-freeze by complete
re-issue, an adoption record with unmutated historical artifacts, synchronized registries, and
version-label non-reuse. Coins no precedence rule, no latest-overlay-wins rule, no version scheme, no
authority level, no Board definition. Does not reconcile the legacy overlay corpus — G-1 remains
OPEN, PARTIALLY INFORMED. Effectiveness is gated on the §7.3 synchronization bundle. DRAFT — awaits
HUMAN approval; not folded by AI.*
