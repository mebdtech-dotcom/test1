# iVendorz — Repository Structure

**Document type:** Structural Constitution — non-authoritative engineering reference defining
**ownership, boundaries, and folder shape** (not implementation design; that is Doc-5…8).
**Date:** 2026-06-23 · **Governance freeze:** 2026-06-27
**Version:** v1.0
**Status:** **FROZEN v1.0** (governance layer freeze `governance-frozen-v1`, 2026-06-27). The
governance *architecture* is ratified; content remains non-authoritative under, and patched to
match, the frozen corpus.
**Authoritative source:** On any conflict, the frozen document wins. See [`project_details.md`](project_details.md)

---

## Review Panel & Standing

This layout is reviewed by the standing architecture roles. Each records the constraint it
guards and its standing on the proposed structure.

| Role | Guards | Standing |
|------|--------|----------|
| **Architecture Board Chair** | Overall conformance, Authority Order, additive-only changes | APPROVE — FREEZE-READY |
| **Principal Enterprise Architect** | Modular-monolith boundaries, deployable shape, cross-cutting concerns | APPROVE |
| **Principal DDD Architect** | One module/one owner, bounded contexts, nested DDD shape, no cross-module imports | APPROVE (DDD shape adopted) |
| **Principal API Governance Reviewer** | `contracts/` as the only importable surface, Doc-4A conformance | APPROVE |
| **Principal Persistence Architect** | One schema per module; Prisma namespace strategy | DEFERRED — opens at Doc-6 |
| **Virtual CTO** | Fewest moving parts, single deployable, scope discipline (constitution not design) | APPROVE (post-patch) |

**Hard-review patch pass (v0.3 — findings resolved):**
1. **MAJOR-01** — outbox ownership/transactional write model bound **by reference** to
   Doc-2/4B/4J/4L; constitution does not define mechanics nor permit M0 table writes — §7.
2. **MAJOR-02 → MINOR** — M0/M9 shape-exception note: canonical shape is default; unused
   layers need not exist; M0 infra-only, M9 derived-artifacts-only — §3.
3. **MINOR-01** — `shared/ids/` restricted to stateless UUIDv7 formatting; human-reference
   allocation is M0-owned — §5.
4. **MINOR-02 / N1** — `generated-contracts-registry/` marked GENERATED + gitignored — §2, §5.
5. **MINOR-03** — read-model provenance: owned data + contracts + events only, never foreign
   tables; explicitly rebuildable — §3.
6. **MINOR-04** — domain value-objects removed from public contract surface (DTOs/IDs only) — §3.
7. **MINOR-05 / search** — search projections follow aggregate ownership — §3.
8. **N4** — raw-SQL cross-schema access explicitly forbidden — §9.
9. **Identity note** — non-binding `roles/permissions/delegation` shape hint — §4.1.

Prior revision retained: nested DDD module shape (`domain/` · `application/` ·
`infrastructure/`), Forbidden Patterns (§9), workflow-ownership rule, admin boundary rule,
AI authority rule, scope discipline. `src/frontend/` remains **reserved for Doc-7**;
`platform/`/`tooling/` rejected (covered by `server/`, `shared/`, `scripts/`, `tests/`).

> **Persistence note (Principal Persistence Architect):** the database mandate is **one
> schema per module** (Doc-2, frozen). The Prisma folder layout and namespace/`multiSchema`
> strategy shown here is **planned implementation structure**, to be ratified in **Doc-6
> (Database Contracts)**. It may change without affecting the architecture.

---

## 1. Governing Constraints (frozen — binding on this layout)

These come from the frozen corpus and are non-negotiable:

1. **Single deployable.** One Next.js application; the modular monolith is internal.
2. **One module, one owner.** Ten bounded modules under `src/modules/`; each owns its domain.
3. **No cross-module table access, no cross-module foreign keys, no cross-module imports** —
   **only `contracts/` is importable** across modules.
4. **One schema per module** at the database level (Doc-2).
5. **Authorization in the app layer.** Supabase RLS is a backstop, not the model.
6. **Transactional outbox owned by M0.** Events flow M0 → Inngest consumers.
7. **Frozen corpus is supreme.** This document is non-authoritative and additive only.

---

## 2. Top-Level Layout

```
ivendorz/
├─ app/                         # Next.js App Router — routing & UI composition only
├─ src/
│  ├─ modules/                  # the 10 bounded modules (one folder, one owner)
│  ├─ shared/                   # framework-level shared code (NOT a domain module)
│  └─ server/                   # app-layer wiring: auth context, org context, DI, guards
├─ prisma/                      # planned: one schema namespace per module (ratify in Doc-6)
├─ inngest/                     # async job functions (consume M0 outbox events)
├─ generated-contracts-registry/          # GENERATED build artifact — gitignored, never hand-edited
├─ tests/                       # cross-module / e2e tests (per-module unit tests live in module)
├─ generatedDocs/               # FROZEN architecture corpus — authoritative, do not edit
├─ scripts/                     # dev/ops scripts (imports, seeding, migration runners)
├─ public/                      # static assets
├─ CLAUDE.md                    # AI-agent guardrails
├─ project_details.md           # project description (non-authoritative)
├─ REPOSITORY_STRUCTURE.md      # this file
├─ package.json
├─ tsconfig.json
└─ next.config.ts
```

---

## 3. Module Internal Structure (the canonical shape)

Every module under `src/modules/<module>/` follows the **same layered shape**, organized by
DDD concern so the structure survives M0→M9 growth, multiple developers, AI-agent authoring,
and multi-year evolution without a "god folder." Only `contracts/` may be imported by other
modules; everything else is module-private.

```
src/modules/<module>/
├─ contracts/                   # ✅ ONLY importable surface cross-module
│  ├─ services.ts               # public service interfaces (typed)
│  ├─ events.ts                 # event names + versioned payload types this module emits
│  ├─ types.ts                  # public DTOs / IDs only (domain value-objects stay private)
│  └─ index.ts                  # the single public entry point
│
├─ domain/                      # ⛔ private — the model; OWNS state & invariants
│  ├─ aggregates/               #     consistency boundaries
│  ├─ entities/
│  ├─ value-objects/
│  ├─ policies/                 #     business rules / firewall enforcement
│  └─ state-machines/           #     lifecycle definitions (conform to Doc-4M)
│
├─ application/                 # ⛔ private — ORCHESTRATION; owns NO state
│  ├─ commands/                 #     state-changing use cases
│  ├─ queries/                  #     read use cases
│  └─ workflows/                #     multi-step orchestration (RFQ, verification, etc.)
│
├─ infrastructure/              # ⛔ private — adapters
│  ├─ data/                     #     Prisma access scoped to THIS module's schema
│  ├─ read-models/              #     disposable projections — NOT source of truth
│  ├─ events/                   #     emitters (conform to frozen M0 outbox pattern) + consumers
│  └─ search/                   #     search projections for THIS module's aggregates (FTS now)
│
├─ api/                         # ⛔ private — route handlers / server actions for this module
└─ <module>.module.ts           # composition root: wires this module, exports contracts only
```

**Layer rules (binding):**
- **Domain owns state and invariants.** All business truth lives here.
- **Application orchestrates only.** Workflows and commands coordinate domain + contracts;
  they **do not own state** and hold no persistent data of their own.
- **Read-models are projections, not source of truth.** They are disposable and
  **rebuildable** from the owning domain. They consume **only** owned data, the module's own
  `contracts/`, and inbound events — **never** another module's tables. They may never be
  treated as authoritative.
- **Search projections follow aggregate ownership.** A module indexes only its own aggregates
  (e.g. Marketplace owns vendor search; RFQ owns RFQ search), sourcing cross-module data via
  `contracts/`/events, never foreign tables.
- **Infrastructure is replaceable.** Swapping Prisma/Inngest/search must not touch domain.

**Shape-exception note (M0, M9):** the canonical shape is the **default**, not a requirement
to populate every folder. **M0 (Platform Core)** is infrastructure-only — it carries no
business `domain/aggregates|policies`; its layers serve platform infrastructure (audit,
outbox, ID generation, config, flags). **M9 (AI, reserved)** may use `domain/` only for
**regenerable derived-artifact models** (recommendations, classifications, similarity) and
never for authoritative aggregates. Unused layers need not exist; a module uses only the
subfolders relevant to its authorized responsibilities.

**Import rule (enforced in CI — see §10):**
- A module may import **only** `@/modules/<other>/contracts` from another module.
- Reaching into another module's `domain/`, `application/`, `infrastructure/`, or `api/` is
  forbidden and fails the build.

---

## 4. The Ten Modules

Folder names map to the frozen schema · doc ownership (project_details.md §3).

```
src/modules/
├─ core/          # M0  Platform Core / Shared Kernel   (core)        · Doc-4B
│                 #     audit, outbox events, ID generation, config, feature flags
├─ identity/      # M1  Identity & Organization         (identity)    · Doc-4C
│                 #     users, orgs, memberships, roles, permissions, delegation
├─ marketplace/   # M2  Marketplace & Discovery         (marketplace) · Doc-4D
│                 #     vendor profiles, microsites, products, categories, ads, favorites
├─ rfq/           # M3  RFQ Procurement Engine           (rfq)         · Doc-4E
│                 #     RFQs, routing, matching, sorting, invitations, quotations
├─ operations/    # M4  Business Operations              (operations)  · Doc-4F
│                 #     post-award docs (LOI/PO/challan/invoice/payment/WCC), CRM
├─ trust/         # M5  Trust & Verification             (trust)       · Doc-4G
│                 #     trust scores, performance scores, verification, fraud signals
├─ comms/         # M6  Communication                    (comms)       · Doc-4H
│                 #     chat, RFQ threads, notifications, delivery logs
├─ billing/       # M7  Monetization                     (billing)     · Doc-4I
│                 #     plans, subscriptions, entitlements, quotas, lead credits
├─ admin/         # M8  Admin Operations                 (admin)       · Doc-4J
│                 #     moderation, bans, approvals, import, authoritative event catalog
└─ ai/            # M9  AI Layer (reserved)              (ai)          · Doc-4K
                  #     regenerable derived artifacts only
```

### 4.1 Module-Specific Boundary Rules (binding)

- **Admin (M8) cannot bypass ownership boundaries.** Admin operates *through* other modules'
  `contracts/` like any caller. It may not write another module's tables, share its
  repositories, or take shortcuts around the owning module's domain. Moderation, bans, and
  approvals are issued as contract calls/events to the owning module, never as direct writes.
- **AI (M9) owns no authoritative data.** The AI module may persist **only** regenerable,
  disposable derived artifacts (recommendations, predictions, classifications, similarity
  results). It never owns an RFQ, vendor profile, quotation, trust score, or subscription.
  It consumes data exclusively via `contracts/`. Per invariant: **AI suggests; modules decide.**
- **Identity (M1) — non-binding shape note.** Identity carries governance-critical concerns;
  its `domain/` will likely organize as `roles/`, `permissions/`, and `delegation/`. This is a
  suggestion for authoring convenience (useful at Doc-5C), **not** a binding constraint.

---

## 5. Cross-Cutting Folders (explicitly NOT domain modules)

```
src/shared/
├─ db/            # Prisma client bootstrap (schema-scoped accessors handed to modules)
├─ result/        # Result/error types, error model per Doc-4A
├─ ids/           # stateless UUIDv7 formatting only — human-reference allocation is M0-owned (via M0 contracts)
├─ validation/    # shared zod/schema primitives (validation order per Doc-4A)
└─ telemetry/     # logging, PostHog wrappers, tracing

src/server/
├─ auth/          # Supabase Auth integration (authentication only)
├─ context/       # server-validated active-org context (client org ID never trusted)
├─ authz/         # app-layer authorization (permission-slug checks, delegation grants)
└─ guards/        # request guards composing auth + org context + permissions

generated-contracts-registry/   # GENERATED, gitignored — build-time aggregation of every module's contracts/ (integration map)
```

> `src/shared/` and `src/server/` hold **framework-level** code, not business domains. They
> must contain **no** module-specific business rules — those belong inside the owning module.

---

## 6. Persistence Boundaries (PLANNED — ratify in Doc-6)

This document fixes only the **ownership boundaries**, not the persistence design:

- **One schema per module** (frozen, Doc-2). Each module's `infrastructure/data/` accesses
  **only its own schema**.
- **No cross-schema foreign keys.** Cross-module references are **by ID only**.
- A module never reads or writes another module's tables — data crosses boundaries through
  `contracts/` services, never through the database.

The concrete Prisma representation — single-file `multiSchema` vs. split schema files,
migration ownership, how each module receives a schema-scoped client — is **deferred to
Doc-6 (Database Contracts)** and intentionally left unspecified here.

---

## 7. Async Jobs & Events (boundaries)

The top-level `inngest/` folder holds job functions that consume events; each job belongs to,
and calls into, exactly one owning module via its `contracts/`. The binding rules:

- Events are written to the **M0-owned outbox in the same transaction** as the business
  record (atomic).
- Consumers are **idempotent**; payloads are **thin** (IDs + minimal metadata) and resolve
  detail via the owning module's `contracts/` services.
- Authoritative event catalog = **Doc-4J**; cross-module flow map = **Doc-4L**.

> **Outbox ownership & transactional write model (binding by reference, not restated here):**
> the outbox table, its ownership, and the same-transaction write pattern are governed by
> **Doc-2, Doc-4B, Doc-4J, and Doc-4L**. This Repository Constitution does **not** define the
> implementation mechanics and does **not** grant a module permission to write M0's tables.
> A module emits events only by conforming to the **frozen outbox pattern** defined in those
> documents — never by direct cross-module table access (see §1.3, §9).

Concrete job decomposition and Inngest wiring are an implementation detail (Doc-5/Doc-8
territory), not fixed by this constitution.

---

## 8. App Router Layout (UI composition only)

```
app/
├─ (public)/               # SSR/SSG marketplace + microsites (SEO-first)
├─ (app)/                  # authenticated buyer/vendor application
├─ (admin)/                # admin operations console (M8-facing)
└─ api/                    # thin edge/route entry points → delegate into module api/ layers
```

`app/` performs **routing and composition only**. Business logic lives in modules; route
handlers call module `contracts/` services through the `src/server/` guards.

---

## 9. Forbidden Architectural Patterns

These patterns are **prohibited** and must fail review/CI. They are the inverse of the rules
above, stated explicitly so developers and AI agents cannot rationalize a shortcut:

- **Shared business logic** — domain rules placed in `src/shared/` or `src/server/` instead
  of the owning module. Cross-cutting folders hold framework code only.
- **Cross-module writes** — any write to a table owned by another module.
- **Cross-module table reads / shared repositories** — bypassing `contracts/` to read another
  module's data layer.
- **Cross-module imports beyond `contracts/`** — importing another module's `domain/`,
  `application/`, `infrastructure/`, or `api/`.
- **Cross-schema foreign keys** — relational links across module schemas (use IDs).
- **Cross-schema raw SQL** — no module may access another module's schema by any means,
  **including raw SQL**; cross-module data flows through `contracts/` only.
- **Admin bypass** — M8 reaching around an owning module's domain to act directly.
- **Workflow-owned state** — `application/workflows/` (or commands/queries) persisting their
  own authoritative data instead of delegating to domain.
- **Read-model as source of truth** — treating a projection as authoritative.
- **AI-owned authoritative data** — M9 persisting anything non-regenerable.
- **Client-trusted org context** — using a client-supplied organization ID instead of the
  server-validated active-org context.

---

## 10. Enforcement (CI)

The structure is enforced, not merely documented:

- **Import-boundary lint** — fail any cross-module import not targeting `…/contracts`
  (e.g. `eslint-plugin-boundaries` or dependency-cruiser rules).
- **No cross-schema foreign keys** — migration check.
- **Contracts-only public surface** — each module exports through `contracts/index.ts`; the
  `<module>.module.ts` composition root exposes nothing else.
- **Doc-4A conformance** — API namespace, validation order, error model, idempotency checks.

---

## 11. Conformance Statement

This layout introduces **no architecture change** and edits **no frozen document**. It
realizes the frozen mandates — single deployable, one module/one owner, contracts-only
cross-module surface, one schema per module, app-layer authorization, M0-owned outbox — as a
concrete folder structure. The persistence representation (§6) remains **open pending Doc-6**.

**Authority:** Frozen Architecture Corpus (supreme) → ADR Compendium → Virtual CTO →
Enterprise Architect → DDD Architect → API Governance Board → Security Architect →
Engineering. This document sits below all of them and is additive only.

---

*Non-authoritative engineering reference. Ratify §6 at Doc-6; patch additively as
implementation contracts (Doc-5…8) land.*
