# REFERENCE — Refactoring Rules (iVendorz canonical) v1.0

| Field | Value |
|---|---|
| Status | **CANONICAL REFERENCE — engineering standard.** Repo-wide rules for **behavior-preserving** code change (extraction, composition, deduplication, rename, move, inline). Not a frozen-corpus decision; binds frozen authorities by pointer; coins no architecture. |
| Mandate | "A refactor changes *structure*, never *behavior* or *contract*. If external behavior, a public contract, an event, an audit action, a wire envelope, or a governance signal changes, it is **not** a refactor — route it through the normal design/patch path." |
| Worked example | **W2-IDN 2A/2B** (`570e0b9`) — extracted `application/commands/_audit.ts` + shared `src/server/identity/command-dedup.ts` tenant-write/create composition; 16 command files (19 audit call sites) + 5 route-handlers thinned; **net −317 lines**, zero behavior change, all gates green. |
| Foundation | CLAUDE.md §7 (Authority Order) · §8 (AI Agent Rules) · §11 (Working Rules) · §13 (Review & Findings Governance) · Golden Rules #7/#8/#9 · the Red-Flag Checklist. |

> **Scope.** Applies to **every** refactor across the 10 modules — backend and frontend, domain/application/
> infrastructure/read-model, kit primitives, and shared FE vocabulary. It codifies *how* to change shape safely.
> It binds frozen authorities by pointer and **coins nothing**. On any conflict with a frozen document, the
> frozen document wins (Flag-and-Halt, §11).

---

## 1. The bright line — what is (and is not) a refactor

**A refactor is a change that preserves observable behavior and every published boundary.** After the change,
for the same inputs the system produces the same outputs, the same events, the same audit rows, the same wire
envelopes, and the same persisted state.

**It IS a refactor** when you: extract a shared helper/component, deduplicate repeated logic, rename a private
symbol, move code within a module, inline a needless indirection, split/merge files, hoist a composition, or
tighten types — **with no change to what the code does.**

**It is NOT a refactor** (stop — use the design/patch path, and get the required review/approval) when the change
touches any *boundary*:

- a module `contracts/` surface (`services.ts` · `events.ts` · `types.ts`) that another module consumes;
- an emitted **event** payload/name, an **audit action** token, or a **Doc-5A wire envelope** / status mapping;
- a **governance signal** (Trust / Capacity / Financial Tier / Performance / Buyer Vendor Status) — §4;
- a DB schema, migration semantics, or an RLS policy;
- an **architecture** decision, module **ownership**, or a **governance invariant** (§8 forbids these to AI).

**Renames are private-only.** A refactor may rename **private** symbols freely; it never renames a **public
identifier** — a contract type, exported API, event name, route path, audit action identifier, permission slug, or
state identifier. Those are boundaries; they change only through the design/patch path, never under this process.

If in doubt about which side of the line a change sits on, treat it as boundary-affecting and escalate.

## 2. The rules (every refactor MUST satisfy)

1. **Behavior in = behavior out.** Prove it, don't assert it. The **same inputs produce the same outputs, state
   transitions, events (and their ordering), audit records, persisted state, and any other externally observable
   behavior — independent of internal implementation details such as timing.** The existing test suite provides **evidence** of preservation — necessary, not sufficient; published
   contracts, frozen documents, and architectural invariants remain **authoritative** (§7). The suite must be
   **green before and green after**, with no test edited to accommodate new behavior; a test that *must* change
   means behavior changed — that is not a refactor (§4).
2. **Stay inside one module boundary.** A refactor never introduces cross-module table access, a cross-module FK,
   or an import of anything but another module's `contracts/`. One Module, One Owner (Golden Rule #2). Shared code
   is extracted **within** the module, or — if genuinely cross-cutting — behind an existing shared surface, never
   by reaching across a boundary.
3. **Reference-never-restate survives extraction.** When you extract or move code, frozen values ride *by pointer*,
   not by copy. Never inline a frozen slug, event name, audit action, POLICY key, or enum literal during a
   refactor; keep the module-owned constant as the single source (§11). Deduplicating two copies of a magic
   literal into one named constant is good; hard-coding a frozen value while extracting is a regression.
4. **Extract the duplication, not a new abstraction.** Deduplicate what is *actually* the same today (the W2 2A/2B
   `_audit.ts` / `command-dedup.ts` extraction). Do not invent speculative generality, config flags, or extension
   points for a future that isn't here — that is scope expansion / feature creep (Golden Rules #8/#9), not a
   refactor.
5. **Match the surrounding code.** The extracted/renamed code adopts the existing naming, layering, and idiom of
   its module (domain owns truth · application orchestrates and owns no state · read-models are disposable ·
   infrastructure is replaceable). A refactor never lets a workflow own state or a read-model become a source of
   truth (Red-Flag Checklist).
6. **No opportunistic behavior changes.** Do not fix a bug, add a feature, change a default, or "improve" an output
   *inside* a refactor. If you spot a defect, land the pure refactor first, then the fix as a **separate** change
   with its own review — so the diff that claims "no behavior change" actually has none.
7. **Frozen documents are untouched.** A refactor is code-only. It never edits a frozen doc, never reopens one to
   "align," and never resolves a frozen-vs-frozen tension locally — Flag-and-Halt and escalate (§11).
8. **Small, reviewable, self-describing.** One refactor = one intent = one commit, `refactor(<scope>): …`. Keep
   pure-move/rename commits mechanically obvious (move without editing, then edit in a follow-up) so a reviewer can
   verify "no behavior change" by reading the diff, not by re-deriving it.
9. **Preserve execution semantics.** A refactor must not alter **idempotency, deduplication, retry behavior,
   transactional boundaries, or event/side-effect ordering.** These are especially load-bearing for command
   handlers, workflows, and asynchronous execution paths (e.g. Inngest jobs) — the worked example's
   `command-dedup.ts` *is* this surface; one dropped dedup key, changed `tx`
   boundary, or reordered append silently changes semantics while the code "looks equivalent."
10. **Performance changes are refactors only if behavior is identical.** A pure optimization qualifies only when it
    preserves all observable behavior, contracts, ordering guarantees, and transactional semantics. The moment it
    trades any of these for speed it is a behavior change — separate it out and review it on its own merits; "it's
    just an optimization" is never a licence to alter observable results.

**Refactor MUST-NOT (quick checklist — for agents).** A single refactor must not: add a feature flag · add
configuration · change a default · change validation · change permissions/authorization · change a state
transition · change event ordering or payloads · change audit behavior · change an API/wire payload or status ·
introduce a `TODO`/stub behavior · rename a public identifier (§1). Any one of these is a behavior/boundary
change, not a refactor — land it separately through the normal design/patch path.

**When in doubt, separate the change.** If a commit mixes structural and behavioral edits, split it in two — the
pure refactor first, the behavioral change second through its own review (Rules 6, 8). If you cannot tell which
kind a change is, treat it as behavioral.

## 3. Red-flag gate — halt before refactoring if the change would…

Run the CLAUDE.md **Red-Flag Checklist** against the *shape* you are about to create. A refactor STOPs and
escalates to human review if it would create a new module, change module ownership, change a governance signal,
change *Users Act / Organizations Own*, introduce cross-module DB access or FKs, import anything but another
module's `contracts/`, let Admin (M8) bypass an owning module's domain, override an ADR, or modify a frozen
document. A refactor that trips any of these has crossed the bright line (§1) and is no longer a refactor.

## 4. The safety loop (the order that proves "no behavior change")

1. **Characterize first.** Confirm the affected surface is covered by tests. If coverage is thin, add
   *characterization* tests that pin **current** behavior **before** you touch the code — then refactor against them.
2. **Green baseline.** `tsc` · `eslint` · `prettier` · the relevant slice/integration suite · full suite — all
   green on the untouched tree. Record it.
3. **Refactor in small steps.** Prefer many small verified moves over one large rewrite. Re-run the fast gates
   between steps.
4. **Green after — identical suite, unchanged.** The **same** tests pass, none edited to fit new behavior. For
   audited/tenant surfaces, re-verify against **real PostgreSQL** that both audit invariants still hold (no write
   without audit; no audit without write) — a composition refactor must not silently drop the shared `tx`.
5. **Diff review — behavior-equivalence, not just taste.** Confirm the diff is structure-only: same call graph
   outcomes, same events, same envelopes, same DB effects. Net line-count usually **drops** (dedup); a growing
   diff on a "refactor" is a smell to explain.
6. **Frontend refactors** additionally preserve **accessibility, keyboard behavior, focus management, and
   ARIA/semantics**, and hold the design/motion contracts: reuse kit primitives and the shared motion vocabulary —
   never re-implement a primitive or coin a one-off duration/easing while "cleaning up" (that is
   duplication-as-architecture; see `/review-a-lens`, motion_standard.md).

## 5. Review & findings (Raise ≠ Accept)

A refactor is reviewed under CLAUDE.md **§13** like any change: BLOCKER = MAJOR = MINOR = 0 to merge; the
reviewer **raises**, the author/presiding authority **adjudicates** (Valid? Applicable? Best for the product?
Consistent with the frozen corpus?). Refactor-specific findings a reviewer should weigh:

- **Behavior drift** — any output/event/audit/envelope/state difference the diff doesn't justify → **BLOCKER**
  (it is not a refactor).
- **Boundary breach** — new cross-module coupling, non-`contracts/` import, inlined frozen value → **BLOCKER/MAJOR**.
- **Speculative abstraction / scope creep** — generality with no present consumer → **MAJOR/MINOR** (§2.4).
- **Untested surface refactored** — no characterization coverage for the changed code → **MAJOR**.
- **Duplication left behind** — a class-fix that patched some sites but not their paraphrase twins → **MAJOR**
  (fix-forward sweeps the *whole* changed surface, not an enumerated list).

## 6. Worked example — W2-IDN 2A/2B (`570e0b9`)

The canonical extraction/composition refactor to copy:

- **Extract shared, in-module.** Repeated per-command audit wiring → one `application/commands/_audit.ts`;
  repeated tenant write/create + dedup composition across 5 route-handlers → one
  `src/server/identity/command-dedup.ts`. Nothing crossed a module boundary.
- **Thin the call sites.** 16 command files (19 audit call sites) and 5 route-handlers now delegate to the shared
  surface; each site shrank to intent. **Net −317 lines.**
- **Behavior held.** No contract, event, audit action, or wire envelope changed; the same suite stayed green
  (audit invariants re-verified on real PostgreSQL); frozen values stayed behind their module-owned constants.
- **One intent, one commit.** `refactor(identity): extract shared tenant write/create + user-audit composition`.

---

*REFERENCE — Refactoring Rules v1.0. A refactor changes structure, never behavior or contract. Stay in one module,
carry frozen values by pointer, extract real (not speculative) duplication, keep the suite green-before/green-after
unchanged, and land any behavior fix as a separate change. Boundary-affecting? It is not a refactor — use the
design/patch path. On any frozen-corpus conflict: Flag-and-Halt.*
