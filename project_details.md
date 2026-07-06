# iVendorz — Project Details

**Document type:** Non-authoritative project description (developer + stakeholder orientation).
**Date:** 2026-06-22
**Authoritative source:** the frozen corpus in [`generatedDocs/`](generatedDocs/). On any
conflict, the frozen document wins. Full reference: [`generatedDocs/iVendorz_Master_Overview_v1.0.md`](generatedDocs/iVendorz_Master_Overview_v1.0.md).

---

## 1. Project Summary

**iVendorz is the Industrial Procurement Operating System for Bangladesh** — a multi-tenant
SaaS platform connecting industrial buyers (factories, plants, EPC contractors, procurement
teams) with their vendors.

iVendorz digitizes the industrial sourcing and vendor-management lifecycle from vendor discovery to procurement execution and supplier relationship management.

Industrial Procurement Operating System for Bangladesh.

**Product blend:**

| Share | Capability |
|------:|------------|
| 40% | B2B industrial marketplace (verified vendor directory, microsites, discovery) |
| 30% | Procurement platform (structured RFQ → quotation → award) |
| 20% | ERP-lite operations (post-award documents, finance records) |
| 10% | Professional vendor network (vendor identity, CRM, reputation) |

**Core flow:** Buyer posts a structured RFQ → platform routes it to capability-matched
verified vendors → vendors submit priced quotations → buyer compares and awards → both
parties execute the post-award commercial workflow (LOI, PO, delivery challan, trade
invoice, payment records, work-completion certificates) on-platform.

**Money boundary:** the platform **never** handles buyer↔vendor transaction money — no
escrow, no wallet, no settlement. It earns only its own revenue: subscriptions, lead
packages, advertising, microsite fees, platform service fees. Escrow is *deferred, not
rejected* — the schema captures commercial intelligence so a future financial-services
module can be added without core redesign.

**Moat (defensibility):**
- The **RFQ procurement engine** — governed, capability-aware matching and routing.
- The **post-award document workflow + vendor CRM** — retention.

**Scaling strategy:** optimize for **100 → 1,000 → 10,000** vendors before 1,000,000.

---

## 2. Architecture

**Style:** Serverless **Modular Monolith**. One Next.js deployable, internally divided into
**10 strictly bounded modules**. Domain-Driven Design. Multi-tenant, **default-private**
(the Organization is the tenant boundary). TypeScript end-to-end.

### 2.1 Tech Stack

| Concern | Technology |
|---------|-----------|
| Frontend | Next.js 15 App Router + React + Tailwind + shadcn/ui |
| Backend | Next.js route handlers + server actions (TypeScript) |
| Database | Supabase PostgreSQL (one schema per module) |
| ORM | Prisma |
| Auth | Supabase Auth (authentication only) |
| Storage / Realtime | Supabase Storage / Supabase Realtime |
| Async jobs | Inngest (matching, routing, notifications, doc generation, imports) |
| Hosting / Email / Analytics | Vercel / Resend / PostHog |
| Search | Postgres full-text now; Meilisearch future |
| AI | Claude + OpenAI APIs (future activation) |

**Baselines:** Node ≥ 20 LTS · TypeScript ≥ 5.x · Next.js 15.

### 2.2 Cross-Cutting Decisions

- Authorization lives in the **app layer**; Supabase RLS is a defense-in-depth backstop,
  not the authorization model.
- **UUIDv7** machine IDs + year-scoped human references (`RFQ-2026-000123`) from Module 0;
  never reused.
- **Multi-currency-ready:** BDT now; currency stored explicitly per value field.
- **Transactional outbox** (Module 0) writes business record + event atomically →
  delivered async by Inngest.

---

## 3. The 10 Modules

Communication is by **services, events, and public contracts only** — no cross-module table
access, no cross-module foreign keys, no cross-module imports (only `contracts/` is
importable). One module, one owner.

| # | Module | Owner (schema · doc) | Owns |
|---|--------|----------------------|------|
| M0 | Platform Core / Shared Kernel | `core` · Doc-4B | audit, outbox events, ID gen, config, feature flags (infra only) |
| M1 | Identity & Organization | `identity` · Doc-4C | users, orgs, memberships, roles, permissions, delegation |
| M2 | Marketplace & Discovery | `marketplace` · Doc-4D | vendor profiles, microsites, products, projects, categories, ads, favorites |
| M3 | RFQ Procurement Engine | `rfq` · Doc-4E | RFQs, routing, matching, sorting, invitations, quotations, comparison |
| M4 | Business Operations | `operations` · Doc-4F | post-award docs, finance records, Vendor CRM |
| M5 | Trust & Verification | `trust` · Doc-4G | trust scores, performance scores, verification records, fraud signals |
| M6 | Communication | `communication` · Doc-4H | chat, RFQ threads, notifications, delivery logs |
| M7 | Monetization | `billing` · Doc-4I | plans, subscriptions, entitlements, quotas, lead credits, platform invoices |
| M8 | Admin Operations | `admin` · Doc-4J | moderation, bans, approvals, import, config policy, authoritative event catalog |
| M9 | AI Layer (reserved) | `ai` · Doc-4K | regenerable derived artifacts only |

**Boundary notes:** M2 may *read* trust scores, never calculate them. M5 stores
verification records; **Admin decides, Trust owns.** M7 uses **entitlements**
(boolean/numeric/enum), never plan-name checks. M4 CRM holds **private** per-buyer vendor
status — never mutates platform-wide scores.

---

## 4. Governance Signals (Firewalled)

Five **independent** signals; must never cross-contaminate.

| Signal | Owner | Scope |
|--------|-------|-------|
| Trust Score (0–100) | M5 | platform-wide |
| Capacity Profile | M2 data / M5 verification | platform-wide |
| Financial Tier (A–E) | M5 | platform-wide |
| Performance Score (0–100) | M5 | platform-wide |
| Buyer Vendor Status | M4 (CRM) | private to one buyer |

**Firewall (binding):** Financial Tier never raises Trust Score; Financial Tier does not
affect Performance Score; Buyer Approved/Blacklisted never mutates platform-wide scores;
no secondary signal dominates trust; no single signal dominates a matching decision. Scores
are auto-calculated under the System actor, never hand-edited.

**Financial Tier (BDT):** A = 0–5 Lac · B = 5–25 Lac · C = 25 Lac–1 Crore · D = 1–5 Crore ·
E = 5 Crore+. Tier = claim; Capacity = evidence. Vendor eligible when RFQ value ≤ tier ceiling.

**Capability matrix (four flags, never a type):** `can_supply` · `can_service` ·
`can_fabricate` · `can_consult`. RFQ `work_nature` must be covered by vendor flags.

---

## 5. RFQ Lifecycle & Routing

> Authoritative state-machine contracts live in **Doc-4M**.

**State machine:**
```
draft → pending_internal_approval (optional) → submitted → under_review → matching
      → vendors_notified → quotations_received → buyer_reviewing → shortlisted
      → closed_won | closed_lost   (cancelled reachable from any active state)
```
Once any quotation is submitted against RFQ v1, v1 is immutable; changes create v2/v3.

**Five-step routing pipeline (deterministic, order matters):**
1. Buyer Filter (routing mode + blacklist floor) — first, binary gate.
2. Category Match (primary 100%, secondary 40%).
3. Verification Eligibility + Probation Pool (default 80/20 verified/new).
4. Financial Tier Eligibility (RFQ value ≤ tier ceiling).
5. Matching Confidence scoring (Tier + Capacity + Performance + Trust; none dominates).

**Routing modes:** Approved Only · Approved+Conditional · Approved+Open Market · Open Market (default).

**Non-disclosure invariant:** a vendor must never detect a blacklist — no notification, no
lead record, no analytics trace, no error, silent absence indistinguishable from non-match.
Enforced at routing, never at presentation; never crosses tenant boundary.

---

## 6. Vendor Identity & Ownership

- **Vendor Profile** = durable identity with exactly **one Controlling Organization**.
- **Authorized Representatives** (0..N orgs) hold scoped Delegation Grants — may quote and
  manage leads; may never transfer ownership, change subscription, delete profile, or modify
  verification.
- **One vendor = one active quotation per RFQ** (replace draft / revise / withdraw, never two active).
- **Quota attribution:** all usage charged to the Controlling Organization. *Representatives act; owners pay.*
- **Trust Score attaches to the Profile** and survives ownership change; transfer runs a
  Trust-Freeze + compliance review to prevent trust laundering.
- **Claim lifecycle:** seeded → invited → claimed → verified. **Visibility:** `buyer_private` | `public`.

---

## 7. Core Invariants (12)

1. Vendor capability = matrix (4 flags), not a label.
2. Two role dimensions: Platform Participation ≠ Org Role.
3. Vendor records carry claim lifecycle + visibility scope.
4. RFQ is a state machine with a control plane.
5. Users act; Organizations own (server-validated active org context; client org ID never trusted).
6. Governance signals are firewalled.
7. One module, one owner (references by ID only).
8. Nothing authoritative is overwritten or hard-deleted (versioned, soft-delete, immutable audit, IDs never reused).
9. Content ≠ Presentation.
10. Financial Tier (capability) ≠ Subscription Plan (commercial).
11. Private exclusion stays private, forever (blacklist undetectable).
12. AI suggests; business modules decide.

---

## 8. Persistence, Audit & Events

- **Soft delete** for critical records (`deleted_at`, `deleted_by`, `delete_reason`; partial
  unique indexes `WHERE deleted_at IS NULL`).
- **Immutable audit** (M0): actor, org, entity, action, old/new value, timestamp, IP, UA.
  Actor types: User · Admin · System · AI Agent. Audit = "what happened"; events = "what next" (separate).
- **Document versioning:** never overwrite; v1→v2→v3 with required change note.
- **Transactional outbox:** atomic record+event; thin payloads; idempotent consumers;
  versioned event names. Authoritative event catalog = **Doc-4J**; flow map = **Doc-4L**.

---

## 9. Authorization & Multi-Tenancy

- Tenant boundary = Organization; default-private (grant tables share visibility).
- 3-layer: `Membership + Permission + Resource Scope = Access` **OR** `Active Delegation Grant = Access`.
- Permission **slugs**, not role names (`can_create_rfq`, never `role == "Manager"`).
- Org roles: Owner · Director · Manager · Officer. Platform staff: Support Admin · Verification Admin · Super Admin.

---

## 10. Document Production Methodology

Staged-freeze discipline. Structure freezes before content is authored:
```
Structure Proposal → Hard Review → Patch → Structure FROZEN
  → Content Pass-A → Review → Patch → Verify → Approved
  → Content Pass-B → Review → Patch → Verify → Freeze Audit → FROZEN
```
Freeze allowed only with no open BLOCKER/MAJOR/MINOR (NITPICKs deferrable). Carried
dependencies resolved **additively** — never reopen a frozen doc.

---

## 11. Current State

**Architecture program = COMPLETE / FROZEN.** Full Doc-4 series ratified:

| Doc | Subject | Status |
|-----|---------|--------|
| Master System Architecture | the "why" | FINAL |
| ADR Compendium | ~20 decisions | v1 frozen |
| Doc-2 | Domain Model + DB Blueprint | FROZEN (v1.0.3) |
| Doc-3 | RFQ Engine operational spec | FROZEN (v1.0.2) |
| Doc-4A | API Standards metastandard | FROZEN |
| Doc-4B…4M | M0–M9 contracts + Integration Index (4L) + State Machines (4M) | FROZEN |

**Phase:** Implementation Governance.
**Active deliverable:** Doc-5A — API Standards (Doc-5 Implementation Contracts program). Doc-5_Program_Governance_Note_v1.0 = APPROVED. Doc-5A structure = FROZEN; content = ACTIVE (§0–§9 drafted via Pass-1…Pass-6; §10–§12 + Appendices A–C remaining; next = §10 Async).
**Next program:** Doc-5 API · Doc-6 Database · Doc-7 Frontend · Doc-8 Tests.
**Status tracker:** architecture = COMPLETE/FROZEN · Doc-5 Program Governance Note = APPROVED · Doc-5A = IN AUTHORING (structure frozen, content in progress) · Doc-5B…5M and Doc-6…8 = BLOCKED pending Doc-5A freeze · application code = NOT STARTED.

**Maturity stages** (POLICY `platform.operating_stage`): Stage A (MVP, ~100 vendors,
declared tiers, basic trust) → Stage B (~1,000, verified tiers, performance scoring) →
Stage C (10,000+, advanced matching, AI assist, enterprise tools).

---

## 12. AI Agent Governance

**AI agents MAY:** generate code · tests · documentation · migration plans.
**AI agents may NOT:** modify architecture · modify ADRs · create new modules · change
ownership boundaries · change governance invariants.

- All AI-generated code requires **AI Coding Supervisor OR human** review before merge.
- **Architecture-affecting artifacts require HUMAN approval** — code review alone is
  insufficient; Supervisor sign-off does not substitute.

### Authority Order (architecture is supreme)
```
0. Frozen Architecture Corpus   ← immutable to all skills
1. ADR Compendium               ← immutable to all skills
2. Virtual CTO → 3. Enterprise Architect → 4. DDD Architect → 5. API Governance Board
→ 6. Security Architect → 7. Engineering → 8. Product → 9. AI Skills
```
Ranks 0–1 change only by additive architecture patch with human approval — never a skill decision.

---

## 13. Golden Rules

1. Users Act, Organizations Own
2. One Module, One Owner
3. Governance Signals Are Firewalled
4. Content ≠ Presentation
5. Private Exclusion Stays Private
6. AI Suggests, Modules Decide
7. No Architecture Redesign
8. No Scope Expansion
9. No Feature Creep
10. Frozen Documents Are Authoritative

---

## 14. Repository Layout (planned)

```
ivendorz/
├─ app/                      # Next.js App Router (public site + authed app)
├─ src/modules/<module>/     # one folder per bounded module
│     contracts/ services/ data/ events/   # only contracts/ importable cross-module
├─ prisma/                   # planned: one namespace per module (ratify in Doc-6)
├─ inngest/                  # async jobs
├─ generatedDocs/            # FROZEN architecture corpus — authoritative
├─ CLAUDE.md                 # AI-agent guardrails
└─ project_details.md        # this file
```

`app/`, `src/`, `prisma/`, `inngest/` are **planned implementation structure** — not yet
on disk. No application code exists yet; the corpus is the blueprint.

---

## 15. Product Management Program

The architecture corpus defines **how the system is built and bounded**. The Product
Management Program, defined below, defines **how the platform succeeds as a business** — the
metrics it pursues, how vendors and buyers progress from acquisition to long-term loyalty,
how operations are run, and the order in which capabilities are released.

This program is authored as a Product Management document set, **parallel to** and **distinct
from** the frozen architecture corpus. It introduces no architecture change and requires no
edit to any frozen document; it operates on top of the architecture. All targets reference
the maturity stages — Stage A (MVP, ~100 vendors), Stage B (~1,000), Stage C (10,000+) — in §11.

### 15.1 — Product KPI Framework
The platform's measurement standard: the authoritative set of metrics that indicate platform
health, each with a precise definition and calculation formula to ensure consistent measurement.

- **Metrics:** North Star Metric; Monthly RFQ Volume; RFQ Response Rate; Vendor Activation
  Rate; Buyer Activation Rate; Vendor Retention; Buyer Retention; Lead Conversion Rate;
  Customer Acquisition Cost (CAC); Lifetime Value (LTV); Revenue per Vendor; Revenue per
  Buyer; Marketplace Liquidity metrics.
- **Deliverable:** KPI Catalog · metric definitions · calculation formulas · Stage-A/B/C targets.

### 15.2 — Vendor Success Journey
The end-to-end vendor lifecycle, from first acquisition to sustained, paying engagement,
including recovery measures when retention is at risk.

- **Lifecycle:** Discovery → Registration → Profile Completion → Verification → First RFQ
  Response → First Win → Subscription Upgrade → Renewal → Retention → Churn Recovery.
- **Deliverable:** vendor funnel · activation milestones · success metrics · retention strategy.

### 15.3 — Buyer Success Journey
The end-to-end buyer lifecycle, from registration to repeat procurement and long-term loyalty.

- **Lifecycle:** Registration → Organization Setup → First RFQ → Vendor Selection → Award →
  Repeat Procurement → Vendor Relationship Management → Long-Term Retention.
- **Deliverable:** buyer funnel · activation milestones · success metrics · retention strategy.

### 15.4 — Marketplace Operations Playbook
The operational governance manual for the team running the marketplace: defined
responsibilities, service-level agreements, and escalation procedures.

- **Scope:** Vendor Verification SLA · RFQ Moderation SLA · Lead Validation SLA · Customer
  Support SLA · category management process · vendor quality review · fraud investigation
  workflow · escalation matrix.
- **Deliverable:** operational procedures · ownership matrix · SLA definitions · escalation rules.

### 15.5 — Mobile Strategy
The product strategy for mobile delivery across vendor and buyer experiences, including
native vs. progressive-web-app sequencing and notification design.

- **Scope:** mobile app roadmap · PWA strategy · vendor mobile experience · buyer mobile
  experience · notification strategy · offline considerations.
- **Deliverable:** phase-wise mobile roadmap · platform priorities · release sequence.

### 15.6 — Product Roadmap
The ordered release plan of capabilities, mapped to the maturity stages.

- **Stage A (MVP):** launch scope and explicitly deferred items.
- **Stage B (Growth):** expanded capabilities and automation.
- **Stage C (Scale):** AI · enterprise procurement · advanced matching · ecosystem services.
- **Deliverable:** feature roadmap · dependency map · priority matrix · release plan.

### 15.7 — Marketplace Liquidity Strategy
The strategy ensuring balanced vendor supply and buyer demand so the marketplace functions
at every stage — the most critical determinant of marketplace viability.

- **Scope:** anchor vendor strategy · category launch strategy · RFQ seeding strategy · buyer
  acquisition strategy · supply/demand balance model · liquidity KPIs.
- **Deliverable:** liquidity playbook · launch sequence · category prioritization ·
  supply/demand targets.

### 15.8 — Program Status & Sequence

| # | Artifact | Priority | Status |
|---|----------|----------|--------|
| 15.1 | Product KPI Framework | High | NOT STARTED |
| 15.2 | Vendor Success Journey | High | NOT STARTED |
| 15.3 | Buyer Success Journey | High | NOT STARTED |
| 15.4 | Marketplace Operations Playbook | Medium | NOT STARTED |
| 15.5 | Mobile Strategy | Medium | NOT STARTED |
| 15.6 | Product Roadmap | High | NOT STARTED |
| 15.7 | Marketplace Liquidity Strategy | Critical | NOT STARTED |

**Authoring sequence:** Marketplace Liquidity Strategy (15.7) and Product KPI Framework (15.1)
are authored first, as they frame all subsequent work; followed by the Vendor and Buyer
Success Journeys (15.2, 15.3), the Product Roadmap (15.6), the Operations Playbook (15.4),
and the Mobile Strategy (15.5). The program proceeds concurrently with the Doc-5…8
implementation contracts, since it governs *what* is built and *in what order*, not *how* the
system is architected.

---

## 16. Project Lifecycle — Start to Completion

The full program from inception to a production-ready, scaled platform. Phases 1–2 are
complete; the remainder is planned.

| Phase | Stage | Description | Status |
|-------|-------|-------------|--------|
| 1 | Vision & Scope | Product definition, market, business model, scope boundaries | COMPLETE |
| 2 | Architecture Program | Master Architecture, ADRs, Doc-2, Doc-3, Doc-4A…4M | COMPLETE / FROZEN |
| 3 | Implementation Contracts | Doc-5 API · Doc-6 Database · Doc-7 Frontend · Doc-8 Tests | IN PROGRESS (active: Doc-5A — structure frozen, content §0–§9 drafted) |
| 4 | Product Management Program | §15 artifacts (KPIs, journeys, operations, roadmap, mobile, liquidity) | NOT STARTED (parallel to Phase 3) |
| 5 | Stage-A Build (MVP) | Core modules, RFQ workflow, declared tiers, basic trust, limited monetization; ~100-vendor beta | NOT STARTED |
| 6 | Stage-A Launch & Liquidity | Anchor vendors, category seeding, buyer acquisition, supply/demand balancing | NOT STARTED |
| 7 | Stage-B Growth | Scale to ~1,000 vendors; verified tiers, performance scoring, full trust-freeze workflow, automation | NOT STARTED |
| 8 | Stage-C Scale | 10,000+ vendors; advanced matching, AI assist, enterprise procurement, ecosystem services, comprehensive analytics | NOT STARTED |
| 9 | Operate & Iterate | Continuous KPI-driven improvement, retention programs, financial-services layer evaluation (deferred escrow) | NOT STARTED |

**Governance throughout:** every phase conforms to the frozen architecture (supreme), the
12 Core Invariants, and the 10 Golden Rules. AI agents may generate code/tests/docs/migration
plans under review; architecture-affecting changes require human approval. Frozen documents
are never reopened — changes are additive only.

---

*Non-authoritative. Patch additively when the frozen corpus changes; never contradict it.*
