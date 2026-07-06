# Journeys — AI Layer (M9, reserved)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File I — AI Layer
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M9 AI Layer (`ai` · Doc-4K — reserved; future activation, Wave 6 advisory
panels)
**Journeys:** J-AI
**Legend/notation:** atlas §2 · **Actor journeys composed:** advisory panels inside `J-PROC` /
`J-SUP` surfaces when activated (marketplace_ux.md §12 `FX-AI` remains the future-extension
hook for a full assistant)

> **Authority stance.** Non-authoritative companion. The cache walk below resolves to **Doc-2
> §10.10 cache attributes** (`expires_at` etc.) + **§3.10** ("regenerable, disposable"); the
> `[fresh]`/`[stale]`/`[expired]` strings are **Doc-4M §M4/§M5 navigation keys, not Doc-2
> states** — quoted here for navigation only, exactly as Doc-4M frames them ("this matrix
> introduces no state"). This is the one journey whose bracketed tokens are navigation keys
> rather than Doc-2 §5/§3 states — an explicit, marked exception to the atlas §2 legend.
> Contracts resolve to **Doc-4K** (BC-AI-1…4). Escalation markers carried verbatim: **`[ESC-AI-EVENT]`** (AI carries no Doc-2 §8
> event) and **`[ESC-AI-SLUG]`** (AI holds no permission slug — advisory access rides upstream
> entitlement, Doc-4L §L5-8 navigation). Binding rails: **"AI suggests; modules decide"**
> (Invariant #12, Golden Rule #6); M9 owns **regenerable derived artifacts only** — never
> authoritative data; no AI output recommends-to-winner, auto-selects, or executes (R6). On any
> conflict the frozen corpus wins and this file is patched.

---

## I1. AI Derived-Artifact Lifecycle — `J-AI`

**Breadcrumb:** Atlas ▸ AI ▸ AI Derived-Artifact Lifecycle

| Ownership | |
|---|---|
| Owner Module | M9 AI (derived artifacts: Recommendation · Prediction · Classification · Similar-Vendor — BC-AI-1…4) |
| Participating Modules | consuming surfaces display advisory output; deciding modules (M2/M3/M4) act only through their own contracts |
| Authoritative Documents | Doc-2 §10.10 (cache lifecycle); Doc-4K |
| Read-only References | Doc-4L §L5-8 (advisory-under-upstream-entitlement, navigation); Doc-7F/7G advisory panels (Wave 6) |

**Actors:** ⚙ System (generation/refresh/expiry). Primary — viewing User (advisory reads under
upstream entitlement). **No AI actor ever mutates a business record.**

**Intent arc:** Question → Suggestion → Human decision → Regeneration.
**Goal:** serve regenerable advisory artifacts — the platform's intelligence without authority.
The lifecycle below is a **cache lifecycle**, not a business machine; every state is disposable
by design.

**Entry:** a consuming surface requests an artifact for a subject (org/RFQ/vendor by ID) under a
valid upstream entitlement.
**Exit:** none terminal in the business sense — artifacts expire and regenerate forever.

```
(absent) → ⚙ generate → [fresh] ⇄ [stale] → [expired] → (regenerate on demand → [fresh])
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §10.10) | Outcome / governance |
|---|---|---|---|---|
| J-AI-01 | Request | advisory read (Doc-4K contracts) under upstream entitlement | `(absent)` | Access gated by the **consumer's** entitlement — M9 holds no slug (`[ESC-AI-SLUG]`) |
| J-AI-02 | Generate | ⚙ artifact computation (BC-AI-1…4 kinds) | `(absent) → [fresh]` | Derived from module data **by service/pointer** — never a source of truth |
| J-AI-03 | Serve | advisory panel display | `[fresh]` | Labelled advisory; **never a recommendation-to-winner, ranking, or auto-action** (R6, Invariant #12) |
| J-AI-04 | Age | ⚙ upstream data changes | `[fresh] ⇄ [stale]` | Staleness is honest — displayed provenance/"as of" |
| J-AI-05 | Expire | ⚙ TTL / invalidation | `[stale] → [expired]` | Disposable; regeneration is the only "repair" |
| J-AI-06 | Decide (human) | the user acts through the **owning module's** journey (e.g. J-CMP evaluation, J-CLM profile work) | — | **AI suggests; modules decide** — the decision path never runs through M9 |

**Governance rails:** M9 emits no Doc-2 §8 event (`[ESC-AI-EVENT]` — carried, never resolved
here); artifacts never feed scores, matching, routing, or any governance signal; deleting the
entire `ai` schema must lose nothing authoritative (regenerability is the ownership test);
future assistant journeys (RFQ assistant, quote assistant, procurement copilot, spec generator,
comparison assistant) are **`FX-AI` reserved extensions** — each needs its own additive
architecture decision before any journey is authored.

**Success:** ✔ every artifact regenerable and disposable; ✔ advisory framing everywhere; ✔ zero
authority leakage; ✔ markers carried verbatim.

**Related:** advisory context for J-CMP (never inside its decision), J-CLM (profile suggestions),
J-CRM link suggestions (`link_confidence` triage) · future extensions per marketplace_ux.md §12
`FX-AI`.

---

## Not Covered (File I ledger)

| Item | Why | Pointer |
|---|---|---|
| RFQ Assistant · Quote Assistant · Vendor/Product Recommendation UX · Procurement Copilot · Spec Generator · Comparison Assistant | **`FX-AI` reserved future extensions** — none designed or coined; each requires an additive architecture/contract decision (human-approved) before a journey exists | marketplace_ux.md §12; CLAUDE.md §8 |
| AI-driven matching or scoring | Constitutionally excluded — matching is M3, scores are M5; AI may never own or influence either | Invariant #12; §4 firewall |
| Model/provider operations (prompts, evals, versions) | Infrastructure concern of the future activation — not a business journey | Doc-4K |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §12 (`FX-AI`) ·
registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-I.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*
