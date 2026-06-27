# CLAUDE.md — iVendorz

**Status:** Governance Constitution — **FROZEN v1.0** (`governance-frozen-v1`, 2026-06-27). The
governance architecture/ownership model is ratified; changes require an additive patch + version
bump. Content remains **non-authoritative under the frozen corpus** and is patched to match it.

> **The repository Governance Constitution + guardrails for AI agents.** Owns the repository-wide,
> permanent governance rules: authority order (§7), AI behavior (§8), **Review & Findings Governance**
> (severity ladder · Validate Findings gate · Raise ≠ Accept · review philosophy), and the Red-Flag
> Checklist. **Non-authoritative *under the frozen corpus*** — it never overrides architecture; on any
> conflict **the frozen document in `generatedDocs/` wins** and this file is patched to match.
> Companions (each a distinct single owner): `REPOSITORY_STRUCTURE.md` = the **Structural Constitution**
> (repository layout & boundaries); program status/roadmap live in `generatedDocs/00_AUTHORITY_MAP.md`
> + `generatedDocs/Program_Status_And_Roadmap.md` — **never restated here.**
> Source: `generatedDocs/iVendorz_Master_Overview_v1.0.md` (v1.3).

---

## 1. What iVendorz Is

The **Industrial Procurement Operating System for Bangladesh** — a multi-tenant SaaS
platform serving industrial buyers (factories, plants, EPC contractors, procurement
teams) and their vendors. Product blend: 40% B2B marketplace · 30% structured RFQ→quote→award
procurement · 20% ERP-lite post-award ops · 10% vendor network/CRM.

**Style:** serverless **Modular Monolith** (one Next.js deployable, 10 strictly bounded
modules). DDD. Multi-tenant, **default-private** — the Organization is the tenant boundary.
TypeScript end-to-end.

**The platform never handles buyer↔vendor transaction money** — no escrow, no wallet, no
settlement. Earns only its own revenue (subscriptions, lead packages, ads, microsite/service fees).

**Moat:** the governed RFQ matching/routing engine (M3) + post-award document workflow & vendor CRM (M4).

---

## 2. Tech Stack

| Concern | Tech |
|---|---|
| Frontend | Next.js 15 App Router + React + Tailwind + shadcn/ui |
| Backend | Next.js route handlers + server actions (TypeScript) |
| Database | Supabase PostgreSQL (one schema per module) |
| ORM | Prisma |
| Auth | Supabase Auth (authentication only) |
| Storage / Realtime | Supabase Storage / Supabase Realtime |
| Async jobs | Inngest (matching, routing, notifications, doc gen, imports) |
| Hosting / Email / Analytics | Vercel / Resend / PostHog |
| Search | Postgres FTS now; Meilisearch future |
| AI | Claude + OpenAI (future activation) |

Baselines: Node ≥ 20 LTS · TypeScript ≥ 5.x · Next.js 15. Exact pins live in `package.json` once code exists.

**Cross-cutting:** authorization in the **app layer** (RLS = defense-in-depth backstop, not the model);
UUIDv7 machine IDs + year-scoped human refs (`RFQ-2026-000123`) from M0; multi-currency-ready (BDT now,
currency stored per value field); events via **transactional outbox** (M0) → Inngest.

---

## 3. The 10 Modules

Cross-module communication is by **services, events, and public contracts only** — **no
cross-module table access, no cross-module foreign keys, no cross-module imports** (only
`contracts/` is importable). **One module, one owner.**

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

Boundary notes: M2 may **read** trust scores, never calculate them. M5 stores verification
records; **Admin decides, Trust owns.** M7 uses **entitlements** (boolean/numeric/enum), never
plan-name checks. M4 CRM holds **private** per-buyer vendor status — never mutates platform-wide scores.

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

**Firewall (binding):** Financial Tier **never** raises Trust Score; Financial Tier does
**not** affect Performance Score; Buyer Approved/Blacklisted **never** mutates platform-wide
scores; no secondary signal dominates trust; no single signal dominates a matching decision.
Scores are **auto-calculated under the System actor, never hand-edited**.

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

Ranks 0–1 are **immutable to all skills** (including the Virtual CTO). Changing them
requires an additive architecture patch **with human approval** — never a skill decision.

---

## 8. AI Agent Rules

**MAY:** generate code · tests · documentation · migration plans.
**MAY NOT:** modify architecture · modify ADRs · create new modules · change ownership boundaries · change governance invariants.

- All AI-generated code requires **AI Coding Supervisor OR human** review before merge. No unreviewed merge.
- **Architecture-affecting artifacts require HUMAN approval** — code review alone is insufficient; AI Coding Supervisor sign-off does not substitute.
- Architecture documents are authoritative. Implementation must conform.

---

## 9. Document Map

> **Program status, phase, and history are NOT tracked here** (a constitution holds permanent
> rules, not state). Single source of truth: `generatedDocs/00_AUTHORITY_MAP.md`
> (authority/status/version per document) + `generatedDocs/Program_Status_And_Roadmap.md` (live
> ledger). This section is a durable *map* of where things live.

The authoritative blueprint lives in `generatedDocs/` (the frozen corpus).

- **FROZEN:** Master System Architecture (FINAL) · ADR Compendium (v1) · Doc-2 (v1.0.3) ·
  Doc-3 (v1.0.2) · Doc-4A…4M (series freeze: `Doc-4_SERIES_FROZEN_v1.0.md`).
- **Corpus navigation:** start at **`generatedDocs/CORPUS_INDEX.md`** (file map) and
  **`generatedDocs/00_AUTHORITY_MAP.md`** (authority/status/version per doc). Don't guess
  canonical files.
- **Implementation entry point:** **`IMPLEMENTATION_START_HERE.md`** (root) — reading order +
  pre-PR checklist for developers and AI agents.
- **Authority pointers:** state machines = **Doc-4M** · authoritative event catalog = **Doc-4J** ·
  cross-module event-flow map = **Doc-4L** · outbox owned by **M0**.
- **Non-authoritative orientation set (root):** `README.md` · `project_details.md` ·
  `REPOSITORY_STRUCTURE.md` (Structural Constitution) · this file (Governance Constitution). All
  mirror the corpus and are patched to match it.
- **Current state (not restated here):** the status SSoT is `generatedDocs/00_AUTHORITY_MAP.md`
  (authority/status/version per document) + `generatedDocs/Program_Status_And_Roadmap.md` (live
  ledger). Current build phase + gated sequence: `generatedDocs/Build_Roadmap_v1.0.md`. No
  per-module freeze narrative is mirrored in this constitution.

---

## 10. Repository Layout (Structural Constitution)

Authoritative layout reference: **`REPOSITORY_STRUCTURE.md`** (the **Structural Constitution** —
repository layout & boundaries; non-authoritative under the frozen corpus; freeze-ready). Read it
before any code-layout work.
Project description: **`project_details.md`**.

```
ivendorz/
├─ app/                              # Next.js App Router — routing & UI composition only
├─ src/
│  ├─ modules/<module>/              # the 10 bounded modules (one folder, one owner)
│  ├─ shared/                        # framework-level code only (NOT a domain module)
│  └─ server/                        # app-layer wiring: auth, org context, authz, guards
├─ prisma/                           # planned: one schema per module (ratify in Doc-6)
├─ inngest/                          # async jobs (consume M0 outbox events)
├─ generated-contracts-registry/     # GENERATED, gitignored — never hand-edited
├─ tests/  · scripts/ · public/
├─ generatedDocs/                    # FROZEN architecture corpus — authoritative, do not edit
│     ├─ CORPUS_INDEX.md             # navigation index for the corpus (start here)
│     └─ 00_AUTHORITY_MAP.md         # authority/status/version per document
├─ README.md · IMPLEMENTATION_START_HERE.md · CLAUDE.md · project_details.md · REPOSITORY_STRUCTURE.md
```

**Canonical module shape (nested DDD)** — only `contracts/` is importable cross-module:
```
src/modules/<module>/
├─ contracts/        # ONLY cross-module surface: services.ts · events.ts · types.ts (DTOs/IDs only) · index.ts
├─ domain/           # private — OWNS state & invariants: aggregates/ entities/ value-objects/ policies/ state-machines/
├─ application/      # private — ORCHESTRATION, owns NO state: commands/ queries/ workflows/
├─ infrastructure/   # private — adapters: data/ read-models/ events/ search/
├─ api/              # private — route handlers / server actions
└─ <module>.module.ts
```

**Binding layer rules:** domain owns truth; application orchestrates and owns no state;
read-models are disposable projections (owned data + contracts + events only, never foreign
tables), never source of truth; search follows aggregate ownership; infrastructure is
replaceable. **Shape-exception:** canonical shape is the default — M0 is infra-only (no
business `domain`), M9 (AI) uses `domain/` only for regenerable derived-artifact models;
unused layers need not exist.

`src/`, `prisma/`, `inngest/`, `app/` are **planned implementation structure**, not yet on
disk. "One Prisma namespace per module" is an implementation choice to be ratified in Doc-6 —
the frozen mandate is "one schema per module" at the DB level (Doc-2). Outbox ownership and
the transactional write model are governed by Doc-2/4B/4J/4L (reference, never restate).

---

## 11. Working Rules for Claude in This Repo

- **Never edit a FROZEN document.** Propose **additive patches** only; carried dependencies are resolved additively, never by reopening a frozen doc.
- **Reference-never-restate** — bind frozen entities/slugs/events/audit actions/POLICY keys **by pointer**; never copy or invent.
- Confirm scope sits inside **one module**; respect One Module, One Owner.
- Read **Doc-4A** (API metastandard) before any contract work; read the owning module's contract doc (Doc-4B…4M) before touching it.
- Before any code-layout/scaffolding work, follow **`REPOSITORY_STRUCTURE.md`**: nested DDD module shape, `contracts/`-only cross-module surface, and the Forbidden Architectural Patterns list.
- **Verify before delivering** — programmatically confirm anchors against the frozen corpus; don't rubber-stamp.
- On any conflict with a frozen doc: **Flag-and-Halt** — cite both sources, escalate; never resolve locally.

---

## 12. Environment Note

Caveman plugin mode may be active in this environment (terse output). Code, commits, and
security/irreversible-action confirmations are always written in normal prose.

---

## 13. Review & Findings Governance

Repository-wide rules for **every** review in this repo — documentation, architecture,
implementation, database, frontend, test, AI, and code reviews. These codify the practice already
used throughout the frozen corpus's Hard Reviews and Freeze Audits; **they coin nothing.**

**Severity ladder** (the labels used in every corpus Hard Review / Freeze Audit):

| Severity | Meaning | Gating? |
|---|---|---|
| **BLOCKER** | Violates the frozen corpus, an invariant, or a Golden Rule; or makes the deliverable wrong/unsafe. | Yes |
| **MAJOR** | Substantive defect/omission that materially degrades correctness, security, or conformance. | Yes |
| **MINOR** | Real but contained defect; does not threaten correctness or conformance. | Yes |
| **NITPICK (NIT)** | Style/clarity/polish. | No (deferrable) |
| **OBS** | Observation — neutral note or future-watch item; no action implied. | No |

**Freeze/merge gate:** a deliverable does not freeze or merge until **BLOCKER = 0 · MAJOR = 0 ·
MINOR = 0**. NITPICK and OBS never block (the corpus freeze-audit convention).

**Separation of Duties — Raise ≠ Accept:**
- The **reviewer raises** findings (each with a severity); the reviewer **never decides implementation.**
- The **author** — or the presiding authority per §7 — **evaluates** each finding and rules on it.
- **Only validated findings are implemented.** A raised finding is a claim, not a mandate; an
  independent review may override a document's self-classification.

**Validate Findings gate** — every finding is adjudicated against four questions before it is actioned:
1. **Valid?** — is the finding factually correct?
2. **Applicable?** — does it apply in this scope/context?
3. **Best for the product?** — is acting on it the right outcome, not just a local fix?
4. **Consistent with the frozen corpus?** — does the resolution conform upward (§7)? If a finding
   conflicts with a frozen document, **Flag-and-Halt** (§11) and escalate — never resolve locally.

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
