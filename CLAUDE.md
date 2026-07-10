# CLAUDE.md — iVendorz

**Status:** Governance Constitution — **FROZEN v1.2** (`governance-frozen-v1`; base freeze
2026-06-27, additive editorial patch v1.1 2026-07-09, additive stack patch v1.2 2026-07-10).
Patch v1.1 is **editorial only** — verbosity and duplication cut; no rule added, removed, or
reworded; §10's directory tree & module-shape block now defer to `REPOSITORY_STRUCTURE.md` rather
than restate it. Patch v1.2 is **additive only** — Framer Motion added to the §2 Frontend stack
row (owner-approved 2026-07-10, WP-MOTION-1 · RV-0154 F7); no rule changed. Governance/ownership
model is ratified; changes require an additive patch + version bump. **Non-authoritative under the
frozen corpus** — on any conflict the frozen doc in `generatedDocs/` wins and this file is patched
to match.

> **Repository Governance Constitution + guardrails for AI agents.** Owns the permanent,
> repo-wide rules: authority order (§7), AI behavior (§8), Review & Findings Governance (§13),
> Red-Flag Checklist. Companions, each a single owner: `REPOSITORY_STRUCTURE.md` = **Structural
> Constitution** (layout & boundaries); status/roadmap = `generatedDocs/00_AUTHORITY_MAP.md` +
> `Program_Status_And_Roadmap.md` — **never restated here**. Source:
> `generatedDocs/iVendorz_Master_Overview_v1.0.md` (v1.3).

---

## 1. What iVendorz Is

The **Industrial Procurement Operating System for Bangladesh** — a multi-tenant SaaS platform
for industrial buyers (factories, plants, EPC contractors, procurement teams) and their vendors.
Blend: 40% B2B marketplace · 30% RFQ→quote→award procurement · 20% ERP-lite post-award ops ·
10% vendor network/CRM.

- **Style:** serverless **Modular Monolith** (one Next.js deployable, 10 bounded modules), DDD,
  multi-tenant, **default-private** — the Organization is the tenant boundary. TypeScript end-to-end.
- **Money boundary:** the platform **never** handles buyer↔vendor transaction money (no escrow,
  wallet, or settlement). It earns only its own revenue (subscriptions, lead packages, ads, fees).
- **Moat:** governed RFQ matching/routing engine (M3) + post-award document workflow & vendor CRM (M4).

---

## 2. Tech Stack

| Concern | Tech |
|---|---|
| Frontend | Next.js 15 App Router + React + Tailwind + shadcn/ui + Framer Motion (motion standard: `docs/frontend/design-system/motion_standard.md`) |
| Backend | Next.js route handlers + server actions (TypeScript) |
| Database / ORM | Supabase PostgreSQL (one schema per module) · Prisma |
| Auth / Storage / Realtime | Supabase (auth = authentication only) |
| Async jobs | Inngest (matching, routing, notifications, doc gen, imports) |
| Hosting / Email / Analytics | Vercel / Resend / PostHog |
| Search / AI | Postgres FTS (Meilisearch future) / Claude + OpenAI (future) |

**Baselines:** Node ≥ 20 LTS · TS ≥ 5.x · Next.js 15 (exact pins in `package.json`).
**Cross-cutting:** authz in the **app layer** (RLS = defense-in-depth backstop, not the model);
UUIDv7 IDs + year-scoped human refs (`RFQ-2026-000123`) from M0; multi-currency-ready (currency
per value field); events via **transactional outbox** (M0) → Inngest.

---

## 3. The 10 Modules

Cross-module communication is by **services, events, and public contracts only** — no cross-module
table access, foreign keys, or imports (only `contracts/` is importable). **One module, one owner.**

| # | Module | Schema · Doc | Owns |
|---|---|---|---|
| M0 | Platform Core / Shared Kernel | `core` · Doc-4B | audit, outbox events, ID gen, config, feature flags (infra only) |
| M1 | Identity & Organization | `identity` · Doc-4C | users, orgs, memberships, roles, permissions, delegation |
| M2 | Marketplace & Discovery | `marketplace` · Doc-4D | vendor profiles, microsites, products, projects, categories, ads, favorites, presentation |
| M3 | RFQ Procurement Engine | `rfq` · Doc-4E | RFQs, routing, matching, sorting, invitations, quotations, comparison |
| M4 | Business Operations | `operations` · Doc-4F | post-award docs (LOI/PO/challan/invoice/payment/WCC), finance records, Vendor CRM |
| M5 | Trust & Verification | `trust` · Doc-4G | trust scores, performance scores, verification records, fraud signals |
| M6 | Communication | `communication` · Doc-4H | chat, RFQ threads, notifications, email/SMS/WhatsApp logs (delivery only) |
| M7 | Monetization | `billing` · Doc-4I | plans, subscriptions, entitlements, quotas, lead credits, platform invoices |
| M8 | Admin Operations | `admin` · Doc-4J | moderation, bans, category/vendor approval, import, config policy (authoritative event catalog) |
| M9 | AI Layer (reserved) | `ai` · Doc-4K | regenerable derived artifacts only — "AI suggests; modules decide" |

**Boundary notes:** M2 may **read** trust scores, never calculate them. M5 stores verification;
**Admin decides, Trust owns.** M7 uses **entitlements** (bool/numeric/enum), never plan-name checks.
M4 CRM holds **private** per-buyer vendor status — never mutates platform-wide scores.

---

## 4. Governance Signals (Firewalled)

Five **independent** signals — must never cross-contaminate.

| Signal | Owner | Scope |
|---|---|---|
| Trust Score (0–100) | M5 | platform-wide |
| Capacity Profile | M2 data / M5 verification | platform-wide |
| Financial Tier (A–E) | M5 | platform-wide |
| Performance Score (0–100) | M5 | platform-wide |
| Buyer Vendor Status | M4 (CRM) | private to one buyer |

**Firewall (binding):** Financial Tier never raises Trust Score and never affects Performance Score;
Buyer Approved/Blacklisted never mutates platform-wide scores; no secondary signal dominates trust;
no single signal dominates a matching decision. Scores are **auto-calculated under the System actor,
never hand-edited**.

---

## 5. 12 Core Invariants

1. Vendor capability = **matrix** (4 flags: `can_supply`/`can_service`/`can_fabricate`/`can_consult`), not a label.
2. Two role dimensions: Platform Participation (Buyer/Vendor/Hybrid/Staff) ≠ Org Role (Owner/Director/Manager/Officer).
3. Vendor records carry claim lifecycle + visibility scope (`buyer_private` | `public`).
4. RFQ is a state machine with a control plane (lifecycle/routing/throttling/sorting/scoring).
5. **Users act; Organizations own** (every user ≥1 org; every business record in an org; server-validated active org context — client-supplied org ID never trusted).
6. Governance signals are firewalled (five independent, no cross-mutation).
7. **One module, one owner** (no cross-table access; references by ID only).
8. Nothing authoritative is overwritten or hard-deleted (versioned docs, soft delete, immutable audit, IDs never reused).
9. Content ≠ Presentation.
10. Financial Tier (capability) ≠ Subscription Plan (commercial).
11. Private exclusion stays private, forever (blacklist undetectable).
12. AI suggests; business modules decide.

---

## 6. 10 Golden Rules

1. Users Act, Organizations Own 2. One Module, One Owner 3. Governance Signals Are Firewalled
4. Content ≠ Presentation 5. Private Exclusion Stays Private 6. AI Suggests, Modules Decide
7. No Architecture Redesign 8. No Scope Expansion 9. No Feature Creep 10. Frozen Documents Are Authoritative

---

## 7. Authority Order

When authorities conflict, higher rank decides. **Architecture is supreme.**

```
0. Frozen Architecture Corpus (Doc-2, Doc-3, Doc-4A…4M, Master Architecture)   ← immutable
1. ADR Compendium                                                              ← immutable
2. Virtual CTO → 3. Enterprise Architect → 4. DDD Architect → 5. API Governance Board
→ 6. Security Architect → 7. Engineering → 8. Product → 9. AI Skills
```

Ranks 0–1 are **immutable to all skills** (including the Virtual CTO). Changing them requires an
additive architecture patch **with human approval** — never a skill decision.

---

## 8. AI Agent Rules

- **MAY:** generate code · tests · documentation · migration plans.
- **MAY NOT:** modify architecture · modify ADRs · create new modules · change ownership boundaries · change governance invariants.
- All AI-generated code requires **AI Coding Supervisor OR human** review before merge — no unreviewed merge.
- **Architecture-affecting artifacts require HUMAN approval** — code review alone is insufficient; Supervisor sign-off does not substitute.
- Architecture documents are authoritative; implementation must conform.

---

## 9. Document Map

> Program status, phase, and history are **not** tracked here (a constitution holds permanent
> rules, not state). This section is a durable *map* of where things live.

- **Authoritative blueprint:** `generatedDocs/` (the frozen corpus). Navigate via
  **`CORPUS_INDEX.md`** (file map) + **`00_AUTHORITY_MAP.md`** (authority/status/version per doc) —
  don't guess canonical files.
- **Frozen set:** Master System Architecture (FINAL) · ADR Compendium (v1) · Doc-2 (v1.0.3) ·
  Doc-3 (v1.0.2) · Doc-4A…4M (`Doc-4_SERIES_FROZEN_v1.0.md`).
- **Authority pointers:** state machines = Doc-4M · authoritative event catalog = Doc-4J ·
  cross-module event-flow map = Doc-4L · outbox owned by M0.
- **Implementation entry point:** **`IMPLEMENTATION_START_HERE.md`** (root) — reading order + pre-PR checklist.
- **Status SSoT (not restated here):** `00_AUTHORITY_MAP.md` + `Program_Status_And_Roadmap.md`;
  build phase + gated sequence = `Build_Roadmap_v1.0.md`.
- **Non-authoritative orientation set (root):** `README.md` · `project_details.md` ·
  `REPOSITORY_STRUCTURE.md` · this file — all mirror the corpus and are patched to match it.

---

## 10. Repository Layout

**Authoritative reference: `REPOSITORY_STRUCTURE.md`** (the Structural Constitution — full directory
tree, root-file policy, canonical nested-DDD module shape, and the Forbidden Architectural Patterns
list). Read it before any code-layout/scaffolding work; it is **not** duplicated here.

Load-bearing rules it enforces (repeated only as guardrails):

- Only `contracts/` (`services.ts` · `events.ts` · `types.ts` = DTOs/IDs only · `index.ts`) is importable cross-module.
- **domain** owns truth; **application** orchestrates and owns no state; **read-models** are
  disposable projections (never source of truth, never foreign tables); **infrastructure** is replaceable.
- One DB schema per module (Doc-2), realized as a 10-schema Prisma multiSchema setup.
- `src/`, `prisma/`, `inngest/`, `app/` are built (Waves 0–1). New root files require Board approval.

---

## 11. Working Rules for Claude in This Repo

- **Never edit a FROZEN document.** Propose **additive patches** only; carried dependencies are resolved additively, never by reopening a frozen doc.
- **Reference-never-restate** — bind frozen entities/slugs/events/audit actions/POLICY keys **by pointer**; never copy or invent.
- Confirm scope sits inside **one module**; respect One Module, One Owner.
- Read **Doc-4A** (API metastandard) before any contract work; read the owning module's contract doc (Doc-4B…4M) before touching it.
- Before any code-layout/scaffolding work, follow **`REPOSITORY_STRUCTURE.md`** (§10).
- **Verify before delivering** — programmatically confirm anchors against the frozen corpus; don't rubber-stamp.
- On any conflict with a frozen doc: **Flag-and-Halt** — cite both sources, escalate; never resolve locally.

---

## 12. Environment Note

Caveman plugin mode may be active (terse output). Code, commits, and security/irreversible-action
confirmations are always written in normal prose.

---

## 13. Review & Findings Governance

Repository-wide rules for **every** review (documentation, architecture, implementation, database,
frontend, test, AI, code). These codify the frozen corpus's Hard Review / Freeze Audit practice —
**they coin nothing.**

**Severity ladder:**

| Severity | Meaning | Gating? |
|---|---|---|
| **BLOCKER** | Violates the frozen corpus, an invariant, or a Golden Rule; or makes the deliverable wrong/unsafe. | Yes |
| **MAJOR** | Substantive defect/omission that materially degrades correctness, security, or conformance. | Yes |
| **MINOR** | Real but contained defect; does not threaten correctness or conformance. | Yes |
| **NITPICK (NIT)** | Style/clarity/polish. | No (deferrable) |
| **OBS** | Observation — neutral note or future-watch item; no action implied. | No |

**Freeze/merge gate:** does not freeze or merge until **BLOCKER = 0 · MAJOR = 0 · MINOR = 0**.
NITPICK and OBS never block.

**Separation of Duties — Raise ≠ Accept:**
- The **reviewer raises** findings (each with a severity); the reviewer **never decides implementation.**
- The **author** — or the presiding authority per §7 — **evaluates** each finding and rules on it.
- **Only validated findings are implemented.** A raised finding is a claim, not a mandate; an independent review may override a document's self-classification.

**Validate Findings gate** — every finding is adjudicated against four questions before action:
1. **Valid?** — factually correct?
2. **Applicable?** — applies in this scope/context?
3. **Best for the product?** — the right outcome, not just a local fix?
4. **Consistent with the frozen corpus?** — conforms upward (§7)? If a finding conflicts with a frozen document, **Flag-and-Halt** (§11) and escalate — never resolve locally.

A finding that fails any of the four is recorded with its disposition and **not** implemented.
Implementation-execution gates (Definition of Ready/Done, Wave Integration/Exit audits) apply this
governance and are owned by `generatedDocs/Build_Roadmap_v1.0.md`.

---

## Red Flag Checklist

STOP immediately if a change would:

- Create a new module
- Change module ownership
- Change a governance signal
- Change Users Act, Organizations Own
- Introduce cross-module DB access (incl. cross-schema raw SQL)
- Introduce cross-module foreign keys
- Import anything but another module's `contracts/`
- Let a workflow own state, a read-model become source of truth, or M9/AI own authoritative data
- Let Admin (M8) bypass an owning module's domain
- Override an ADR
- Modify a FROZEN document

Escalate to human review.
