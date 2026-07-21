# ReviewA_Record_RankZero_Amendment_Mechanism_v1.0.md

> **Review record — Team-4 Review-A.** Subject:
> `governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.0_PROPOSAL.md` (→ ADR-027).
> Raise ≠ Accept (`CLAUDE.md §13`): §1–§2 are the reviewer's findings **as raised** and are
> **preserved unedited**. Adjudication is added in §3 **alongside**, never woven into, the findings.
> Non-authoritative; records actions.

| Field | Value |
|---|---|
| Round | 1 · 2026-07-21 |
| Reviewer | Team-4 Review-A — independent agent; the proposal author did **not** self-review |
| Verdict | **🟠 REVISION REQUIRED** |
| Counts | **1 BLOCKER · 9 MAJOR · 10 MINOR · 1 NIT · 3 OBS** |
| Gate (`CLAUDE.md:225`) | BLOCKER = 0 · MAJOR = 0 · MINOR = 0 — **NOT MET** |
| Review-B | not run |
| Reviewer's summary | *"The chosen route (RZ-3 base re-freeze / RZ-4 versioned supersession) is sound and is in fact closer to rank-0 practice than the instrument realizes. What fails is the grounding: the premise, the gap analysis, and the 'coins nothing' framing. Every future amendment inherits the citation chain, so the chain must hold."* |

---

## 1. Findings as raised (preserved unedited)

### BLOCKER

**B-1 — The instrument's entire premise is grounded on documents that self-declare NON-AUTHORITATIVE; rank 0 and rank 1 were never swept.**
*Instrument:* §1:38–42 · Status "Authority" row :31 · §3 header *"Verified absent from the corpus"*.
*Conflicting source:* `00_AUTHORITY_MAP.md:3` (*"Non-authoritative pointer"*), `:7–9` (*"This map only states which document decides; it never restates a decision"*), `:187` (`00_AUTHORITY_MAP.md` | NON-AUTHORITATIVE), `:216` (`CLAUDE.md` | NON-AUTHORITATIVE).
Both cited sources are non-authoritative by their own declaration; the Status "Authority" row cites **zero rank-0 or rank-1 sources** for a rank-1 instrument. No rank-0/1 sweep was performed: `Master_System_Architecture_v1.0_FINAL.md:284` (*"Controlled documents are versioned, never edited in place"*), `:1194` (*"Never overwrite — v1 → v2 → v3; never edit in place"*), `:1392`, and ADR-010 (Document Versioning) are neither cited nor distinguished — the repo's own *"grep the CONCEPT, not just the token"* failure mode, and a breach of `CLAUDE.md:197` (*"Verify before delivering"*). Independent sweep confirms **no corpus-amendment rule exists at rank 0 or rank 1**; `ADR_Compendium_v1.md:9` concerns reading precedence only, `:511` is RFQ-scoped. **Consequence: the instrument is solving a differently-shaped problem than it states** — ADR-027 would be the *first-instance* rule, not a narrow exception to a superior rule, which makes §6's *"Does not relax `CLAUDE.md:192`"* incoherent. *Mitigating:* re-grounding likely strengthens the instrument, since `Master:284`/`:1194` are versioned-re-issue rules — exactly RZ-3/RZ-4.

### MAJOR

**M-1 — RZ-1/RZ-3 depart from the one clause governing changes to ranks 0–1, and §2 restates it lossily.** §2:67, RZ-2:129, Status :31 vs `CLAUDE.md:139–140` / `00_AUTHORITY_MAP.md:30–31`: both require an ***additive*** architecture patch with human approval. §2's row drops *"additive"*; RZ-1/RZ-3 then authorize a non-additive full re-issue citing those same lines as authorization. Also breaches `CLAUDE.md:193` (Reference-never-restate). The tension is never surfaced.

**M-2 — Undisclosed coining; §6 lists only non-coinings.** §2:62 (*"coins nothing that the corpus already provides"* — a tautology), §6:229–238, closing :292–293. Coined and undisclosed: **RZ-1** (admissibility test + the "convenience/tidiness/consolidation are not grounds" bar), **RZ-3** (the route), **RZ-4** (PROVENANCE repurposing + `Superseded by` append duty), **RZ-6** (four registration duties incl. "amended row-wise, not merely flipped"), **RZ-8 bullets 1–2** (document version-label non-reuse — a new binding rule; and the mandatory dual Authority-Map + on-disk sweep). Needs an explicit **"What this instrument coins"** section.

**M-3 — RZ-5's disjointness premise is falsified; G-1 bites the existing corpus today.** RZ-5:168–177 asserts existing patches are *"a union of disjoint parts."* Counter-evidence, all live, bases unedited: `AuthMap:123` — `Doc-6C_Patch_v1.0.1` *"permission-slug count 45→**43** … **corrects** Doc-6C §5.1 + CHK-6-062 assertions"* (base says 45, patch says 43 — **contradictory, no tiebreak**); `AuthMap:121` — v1.0.3 then restores 43→45→46→47, four overlapping claims about one number; `AuthMap:72` — Doc-4M v1.0.1/v1.0.2 index corrections, base untouched; `AuthMap:86` — Doc-5D v1.0.1 carries *"a conformance correction."* RZ-5 declares the gap closed while leaving a live un-tiebroken contradiction class.

**M-4 — RZ-1's admissibility test is empirically false in this corpus, and the safeguard is unspecified.** §1:46–50 and RZ-1:120–125. The corpus has repeatedly expressed corrections additively via overriding overlays — including at rank 0 (Doc-4M v1.0.1/v1.0.2, owner-approved) and below (Doc-6C v1.0.1, Doc-5D v1.0.1). Either those folds were wrong or RZ-1's premise is. The safeguard (*"a reviewer must independently confirm"*) supplies no criteria and no record of the negative test.

**M-5 — RZ-4 authorizes editing a frozen file, contradicting §6 and adjacent to a Red-Flag item.** RZ-4:164–166 requires the superseded file carry an append-only `Superseded by` pointer *"and is otherwise never edited."* Appending **is** a byte-level edit of a FROZEN document — what `CLAUDE.md:192` forbids and §6:231 says is not relaxed, against Red-Flag *"Modify a FROZEN document."* The sole precedent (`BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md:18`) is a `governanceReviews/` board record, not corpus, and is **pre-provisioned**; no `generatedDocs/` frozen document has such a row. Self-contradictory: RZ-4 assigns `PROVENANCE`, defined at `AuthMap:45` as *"reference only, never reopened."*

**M-6 — G-4 / RZ-8 / RZ-O1 / §6 rest on an out-of-scope citation.** §3:109, RZ-8:207, §6:236, §7.1:248 cite `Doc-5A_Content_v1.0_Pass10.md:59`. Quote verbatim but the subject is the **`Iv-Api-Version` API surface identifier**; `:61` binds: *"surface-version identifiers are API-surface identifiers only … MUST NOT be interpreted as a domain, entity, state-machine, or event version."* Scope error repeated in four places. Whether a document-version scheme exists is **unverified**.

**M-7 — Rank-1 competence over rank-0 change is asserted, not argued.** §7.2:252–257, Status :28. `AuthMap:15` / `CLAUDE.md §7`: *"Architecture is supreme. Higher rank overrides lower."* §7.2's rationale establishes immutability-to-skills, not competence-over-rank-0. The instrument should state the basis on which a rank-1 artifact governs rank-0 change (e.g. that it records a Board act operating outside the ladder per the human-approval carve-out at `CLAUDE.md:139–140`).

**M-8 — RZ-6 altitude: a rank-1 ADR makes normative duties out of non-authoritative, unregistered, DRAFT files.** RZ-6:181–191 mandates updates to `CORPUS_INDEX.md`, **`esc_registry.md`**, `README.md`, `project_details.md`, `REPOSITORY_STRUCTURE.md`. `esc_registry.md:4` is *"DRAFT v0.3 — non-authoritative companion"*, `:19` *"on conflict the frozen corpus wins"*, and it has no Authority Map row. Inverts the authority order and conflicts with the ADR-altitude rule. Recommend RZ-6 items 2–4 be recast **Informative — Non-Normative**; only item 1 normative.

**M-9 — Completeness: the consequential amendment of `CLAUDE.md:192` is neither scheduled nor acknowledged.** §6:231 vs RZ-1:120–122 and RZ-6.4:189–191. If ADR-027 folds, `CLAUDE.md §11:192` becomes inconsistent with rank 1 and must be patched — and `CLAUDE.md:3` stamps itself **FROZEN v1.3**, so per `Governance_Freeze_v1.0.md:51–53` that requires an additive patch plus a stamp bump. RZ-6 lists no such step; §8 has no such gate. Evidence the mirror duty is already unmet: `CLAUDE.md:162` still says Doc-2 **v1.0.3** while `AuthMap:55` says **v1.0.10**.

### MINOR

| ID | Location | Finding |
|---|---|---|
| **m-1** | §2:80; §5 step 5 (:220) | `Doc-4D_Structure_Freeze_Gate_v1.0.md:13` is **blank**. The verbatim-anchor rule is at **:12** and **:18**. Off-by-one, cited twice, one a normative gate step. |
| **m-2** | RZ-7:195–196 | `CLAUDE.md:161–162, 169` cited for "status SSoT". `:161` ends the don't-guess bullet, `:162` is the frozen-set list, `:169` is the non-authoritative orientation set. The Status-SSoT statement is at **:167–168**. |
| **m-3** | §2:73 vs RZ-3:150 | Freeze Certification block cited as `:183–191` and `:185–191`. Pick one. |
| **m-4** | §7.1 RZ-O2:249 | *"A sixth undefined status"* undercounts: **`RATIFIED`** is also live (`AuthMap:76`, `:77`) and absent from the legend. At least **two** undefined levels. |
| **m-5** | Header :11–13 | *"The corpus has already recorded this same collision independently."* Source is `BOARD-PACKET-A7R-PARTICIPATION-LENS_**v0.1**.md` — a draft packet in `governanceReviews/`, not the corpus; its "§11" is the same non-authoritative `CLAUDE.md`. Independence claim inflated. |
| **m-6** | §2:78; RZ-8:204 | *"next free **label**"* ← source says *"Next free **version** = v1.7"*, about Doc-3 policy-key patch numbering, in a **PROVENANCE-class** record (`AuthMap:114`). Elevated to "the operative practice" and made normative. Over-claim. |
| **m-7** | RZ-6.3:186–188 | Names *"scope, **status**, and the Interim-presentation and Channel columns."* `esc_registry.md:25` header is `Handle \| Scope / gap \| Interim presentation \| Channel` — **there is no `status` column**. |
| **m-8** | §2.1:83–96 | Selective. Omits that `:18` calls re-issue *"the **established model**"* and `:104` says *"no further review required"* (cutting **against** G-2), and omits that the CD-MA-1 delta was **purely additive** — so the nearest precedent is not precedent for the correction/rename/removal shapes RZ-1 admits. |
| **m-9** | §2 table :64–81 | Mixes rank-0, rank-1, NON-AUTHORITATIVE and PROVENANCE sources in one "what already exists" table with **no authority-level column** — the flattening is what enables B-1. |
| **m-10** | RZ-4:160–162 | Repurposes `PROVENANCE` — defined at `AuthMap:45` as *"Lifecycle record (reviews/patches/audits)"* — to cover a **superseded canonical base**, which is none of those. Extends a defined level while claiming to reference it. |

### NITPICK / OBS

- **N-1** (§8:279–284) — §7.2/§7.3 stamped **Board-RULED 2026-07-21** while Review-A shows *"☐ not run"*. Inverts the chain the instrument itself codifies at §5 (`AuthMap:65`), and means M-7/M-3/M-5 reach a Board that has already ruled adjacent questions.
- **OBS-1** — §7.2's declined alternative `Governance_Freeze_v1.0.md` is a **root** file, NON-AUTHORITATIVE (`:7`), Authority-Map-unregistered, and `:8` scopes it to *"the repository governance/orientation layer only — not the frozen architecture corpus."* Declining it is correct; the path should be stated.
- **OBS-2 — verified TRUE, recorded for the Board:** §2.1's central precedent claim is accurate and independently confirmed (Architecture §15.3 at `Master…:1004–1015` still holds pre-patch text); **ADR-027 is genuinely free**; ADR-021…026 all allocated by proposal; the ADR-021/024/025 carried-alongside fold form is exactly on precedent; the Doc-4D v1.0.1 double-issue is real; and Invariant 8's never-reuse clause is correctly read as scoped to identifiers (`Master…:1186–1191` confirms "controlled documents" = *business* documents) — so **RZ-8 is properly an extension**.
- **OBS-3** — Board's 7 questions: Q1→RZ-1 ✅ · Q2→RZ-2 ✅ · Q3→RZ-3 ✅ · **Q4 (precedence) → dissolved, not answered — residual hole per M-3** · Q5→RZ-4 ✅ · Q6→RZ-6 ✅ (altitude M-8) · Q7→RZ-7 ✅ (citation m-2). **6 of 7 answered; Q4 partial.**

### Red Flag Checklist

No item **tripped**. **One adjacency, undisclosed:** RZ-4's `Superseded by` append modifies a FROZEN document (M-5). The instrument is architecture-affecting and correctly self-routes to human Board approval per `CLAUDE.md:149`. **Flag-and-Halt properly raised in the header and not resolved locally — exemplary.**

---

## 2. Citation verification (reviewer's, preserved)

28 anchors checked. **Verbatim-correct:** the 5 authority levels (`AuthMap:39–45`), FROZEN definition (`:42`), `CLAUDE.md:192/198/225/229–238`, Freeze Reconfirmation Gate (`:5`), Auto-Freeze + Certification block, *"as amended by … re-issued as"* (`Doc-4D…:187`, `Doc-4E…:92`), `Supersedes` rows, `Superseded by` pointer, `effective =` (4 of 4), Existing-Text/Amendment-Text grammar (`Doc-4C_PassA_Patch_v1.0.1.md:38`), review chain (`AuthMap:65`), ADR-021/024/025 precedent, owner-as-human-Board (`ADR-024:3, :18`), role roster (`Reconfirmation:9`), Doc-4D v1.0.1 double-issue, ADR-027 free, Invariant-8 scoping.

**Defective:** #3 lossy (drops *"additive"*) → M-1 · #14 misquoted + over-claimed → m-6 · #16 **line 13 is blank** → m-1 · #20 undercount (`RATIFIED`) → m-4 · #25 **out of scope** (API surface identifier) → M-6 · #26 draft packet, not corpus → m-5 · #27 wrong path/level → OBS-1 · #10 pre-freeze consolidations, not amendment of a frozen base · #12 pre-provisioned, non-corpus → M-5 · #22 verified but selective → m-8.

---

## 3. Adjudication (`CLAUDE.md §13` four-question gate)

Author's evaluation, recorded **without altering §1**. Board rulings in §4 govern where they differ.

| ID | Valid? | Applicable? | Best for product? | Corpus-consistent? | Disposition |
|---|---|---|---|---|---|
| **B-1** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED.** Confirmed independently: `Master…FINAL.md:284` states the principle, `:1186–1196` scopes "version-controlled documents" to product/procurement/company **business** documents. Rank 0/1 is therefore **silent on corpus amendment**. Instrument must be re-grounded as **first-instance**, not an exception. |
| **M-1** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED.** Restore *"additive"* in the paraphrase and surface the tension explicitly rather than citing the clause as authorization. |
| **M-2** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED.** Add a *"What this instrument coins"* section enumerating RZ-1, RZ-3, RZ-4, RZ-6 and RZ-8 bullets 1–2. |
| **M-3** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED.** Independently confirmed: `AuthMap:123` — `Doc-6C_Patch_v1.0.1` *corrects* its frozen base 45→43, base untouched, both live, no tiebreak. G-1 is **open**, not dissolved. |
| **M-4** | ⚠️ **partial** | ⚠️ | ✅ | ⚠️ | **PARTIALLY ACCEPTED.** The Doc-4M leg does **not** hold: `AuthMap:72` records Doc-4M as *"Navigational state-machine index — **non-normative by its own header**; canonical machines = Doc-2 §5."* Correcting a non-normative index is not precedent for correcting normative rank-0 text. The Doc-6C/Doc-5D legs **do** hold (corrections of derived docs toward a higher authority). RZ-1's premise survives but must be **narrowed and must reconcile all four folds**, and the safeguard must state a test. |
| **M-5** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED** — see Board ruling §4. |
| **M-6** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED** — see Board ruling §4. |
| **M-7** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED.** State the basis explicitly: the instrument records a **human Board act** under the `CLAUDE.md:139–140` human-approval carve-out; rank-1 status confers immutability-to-skills, not competence over rank 0. |
| **M-8** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED.** Recast RZ-6 items 2–4 as *Informative — Non-Normative*; only `00_AUTHORITY_MAP.md` normative. |
| **M-9** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED as re-framed by §4** — `CLAUDE.md` is non-authoritative, so ADR-027's validity does not depend on patching it; the update is downstream **synchronization**, and §6's *"does not relax :192"* must be struck as incoherent. |
| **m-1 … m-10** | ✅ | ✅ | ✅ | ✅ | **ALL ACCEPTED**, mechanical corrections. m-9 (authority-level column in §2) is the structural fix that prevents B-1 recurring. |
| **N-1** | ✅ | ✅ | ✅ | ✅ | **ACCEPTED** — see §5. |
| **OBS-1/2/3** | — | — | — | — | Recorded. OBS-2 confirms the §2.1 precedent reading is sound; OBS-3 Q4 tracked as open G-1. |

No finding was dismissed. **M-4 alone is partially accepted**, on the Doc-4M leg only.

---

## 4. Board rulings — 2026-07-21

**Fork: (a) KEEP BASE RE-FREEZE.** Generic overlay precedence **REJECTED** as a future model.
Rationale of record:

> The Doc-6C discovery proves a real defect — frozen base says 45, effective patch says 43, both
> live, no authoritative precedence rule. But that does not make corrective overlays the right
> future model; it proves the additive-only practice **accumulated unresolved contradictions**.
> Using that defect as precedent would institutionalize the weakness: *legacy ambiguity → future
> governance model.* The long-term deterministic rule remains: approved canonical amendment → new
> complete canonical version → prior version historical → **exactly one active canonical text**.
> That is easier for engineers, reviewers and AI agents than reconstructing authority from a base
> plus an arbitrary chain of patches.

**ADR-027 re-grounded as first-instance.** It governs **future rank-0 canonical amendments only**,
and must not describe itself as an exception to `CLAUDE.md` or the Authority Map. Normative posture:
no concurrent rank-0 canon · no permanent corrective overlays for rank 0 · no "latest file wins" ·
no inference from filenames or version numbers · canonical amendments produce a complete re-issued
version. Invariant 8 may be cited **only as an analogous governance principle**, not as direct
authority over corpus documents — suggested wording of record:

> The mechanism extends the corpus's established controlled-document principle by analogy: material
> canonical changes are issued through a new version rather than silently mutating the previously
> certified artifact.

**Legacy contradictions → a SEPARATE reconciliation instrument.** Not authorized to create more
overlays; its job is to reconcile historical ones: (1) inventory every frozen base + effective patch
set; (2) identify contradictions vs additive disjoint extensions; (3) define the authoritative
effective reading per legacy set; (4) consolidate contradictory sets into a complete re-issued
canonical version; (5) retire ambiguity once consolidated. For Doc-6C specifically: verify the
intended effective value → issue a consolidated Doc-6C version → mark the earlier base and patch
historical.

**G-1 disposition — OPEN, not dissolved:**

> **G-1 — Legacy base/patch precedence.** Status: **OPEN.** Scope: existing effective-patch corpus.
> Resolved by ADR-027: **NO.** Resolution vehicle: separate legacy reconciliation instrument.

ADR-027 must state explicitly that it does **not** retroactively determine precedence among existing
lower-rank base/patch combinations.

**M-5 ruling — RULED.** Remove the instruction to append `Superseded by` into an already-frozen
file; that edits the historical artifact and conflicts with the provenance claim. Correct model:
old document **unchanged historical artifact** · new document contains `Supersedes: <old document>`
· the **authority registry** marks old historical / new active. **No reciprocal mutation of the old
document.**

**M-6 ruling — RULED.** Remove all use of the Doc-5A API-version citation from corpus-version
governance; it is not applicable. Patch-vs-major classification stays **open** unless a separate
corpus-versioning policy is deliberately authored. ADR-027 needs only: *use the next unused version
label; never reuse a previously issued label.* It does not need to define semantic versioning.

**`CLAUDE.md` consequence — RULED.** Because `CLAUDE.md` is non-authoritative, ADR-027 does **not**
depend on patching it to become valid. Once ADR-027 is accepted, `CLAUDE.md` is updated separately
so contributor instructions do not contradict the authoritative mechanism. That update is
**synchronization, not part of ADR-027's authority chain.**

---

## 5. Procedural correction (N-1)

The §7.2 fold-form election and §7.3 RZ-O4 disposition were obtained **before** Review-A ran, at the
author's invitation. That inverts the chain the instrument itself codifies at §5 (`AuthMap:65`).

**Ruled:** those labels are downgraded from **`Board-RULED`** to **`OWNER DIRECTION — PRE-REVIEW,
NON-FOLDING`**, with this acknowledgement of record:

> The direction selected the intended drafting route. It did **not** constitute review acceptance,
> fold approval, or canonical authority.

The substance of both directions (ADR-027 as fold form; RZ-O4 historical-only with revalidation
required) is unchanged — only their governance status is corrected.

---

## 6. Status

**Not folded. Not approved. No file was modified by the review.**

Sequence ruled by the Board: (1) preserve Review-A exactly ✅ *this file* · (2) add adjudication
without rewriting the findings ✅ §3 · (3) mark prior Board-RULED labels procedurally premature ✅ §5
· (4) revise Instrument 1 ☐ · (5) route the revised instrument to a **fresh independent review** ☐.

The parked vendor-type amendment
(`MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1.md`) is **not touched** by this
work and remains blocked on ADR-027.
