# iVendorz

> **ivendorz.com — Industrial Procurement Hub & Operating System for Bangladesh.**
> iVendorz digitizes the industrial sourcing and vendor-management lifecycle — from vendor
> discovery to procurement execution and supplier relationship management.

A multi-tenant SaaS platform connecting industrial buyers (factories, plants, EPC contractors,
procurement teams) with their vendors. iVendorz blends a B2B industrial marketplace, a governed
RFQ → quotation → award procurement workflow, ERP-lite post-award operations, and a
professional vendor network on one shared foundation.

---

## What it does

| Share | Capability |
|------:|------------|
| 40% | **B2B industrial marketplace** — verified vendor directory, microsites, discovery |
| 30% | **Procurement platform** — structured RFQ → quotation → comparison → award |
| 20% | **ERP-lite operations** — post-award documents (LOI, PO, challan, invoice, payment, WCC) |
| 10% | **Vendor network** — vendor identity, CRM, reputation |

**Core flow:** a buyer posts a structured RFQ → the platform routes it to capability-matched,
verified vendors → vendors submit priced quotations → the buyer compares and awards → both
parties run the post-award commercial paperwork on-platform.

**Money boundary:** the platform **never** handles buyer↔vendor transaction money — no escrow,
no wallet, no settlement. It earns only its own revenue: subscriptions, lead packages,
advertising, microsite fees, and platform service fees.

**Defensibility:** the governed, capability-aware **RFQ matching/routing engine**, plus the
**post-award document workflow + vendor CRM** for retention.

---

## Tech stack

| Concern | Technology |
|---------|-----------|
| Frontend | Next.js 15 App Router + React + Tailwind + shadcn/ui |
| Backend | Next.js route handlers + server actions (TypeScript) |
| Database | Supabase PostgreSQL (one schema per module) |
| ORM | Prisma |
| Auth | Supabase Auth (authentication only) |
| Storage / Realtime | Supabase Storage / Supabase Realtime |
| Async jobs | Inngest |
| Hosting / Email / Analytics | Vercel / Resend / PostHog |
| Search | Postgres full-text now; Meilisearch later |
| AI | Claude + OpenAI (future activation) |

**Baselines:** Node ≥ 20 LTS · TypeScript ≥ 5.x · Next.js 15.

---

## Architecture in one paragraph

Serverless **Modular Monolith** — one Next.js deployable, internally divided into **10 strictly
bounded modules** following Domain-Driven Design. Multi-tenant and **default-private**, with the
**Organization** as the tenant boundary. Modules communicate only through services, events, and
public contracts — no cross-module table access, no cross-module foreign keys, no cross-module
imports (only `contracts/` is importable). **One module, one owner.**

| # | Module | Owns |
|---|--------|------|
| M0 | Platform Core / Shared Kernel | audit, outbox events, ID generation, config, feature flags (infra only) |
| M1 | Identity & Organization | users, orgs, memberships, roles, permissions, delegation |
| M2 | Marketplace & Discovery | vendor profiles, microsites, products, categories, ads, favorites |
| M3 | RFQ Procurement Engine | RFQs, routing, matching, invitations, quotations, comparison |
| M4 | Business Operations | post-award documents, finance records, Vendor CRM |
| M5 | Trust & Verification | trust scores, performance scores, verification, fraud signals |
| M6 | Communication | chat, RFQ threads, notifications, delivery logs |
| M7 | Monetization | plans, subscriptions, entitlements, quotas, lead credits |
| M8 | Admin Operations | moderation, bans, approvals, import, config policy |
| M9 | AI Layer (reserved) | regenerable derived artifacts only — "AI suggests; modules decide" |

---

## Project status

The full design + realization + verification corpus — architecture, Doc-5 (API), Doc-6 (DB),
Doc-7 (frontend), Doc-8 (test & conformance) — is **complete and frozen**; application code is
gated by the Doc-8 conformance fabric. Program status has a **single source of truth** — it is
not tracked in this file:

- **Per-document authority & status:** [generatedDocs/00_AUTHORITY_MAP.md](generatedDocs/00_AUTHORITY_MAP.md)
- **Current build phase & gated sequence:** [generatedDocs/Build_Roadmap_v1.0.md](generatedDocs/Build_Roadmap_v1.0.md)

**Scaling target:** optimize for **100 → 1,000 → 10,000** vendors before 1,000,000.

---

## Repository

```
ivendorz/
├─ generatedDocs/            # FROZEN architecture corpus — authoritative, do not edit
├─ src/modules/<module>/     # PLANNED — 10 bounded modules; only contracts/ importable cross-module
├─ app/  prisma/  inngest/   # PLANNED implementation structure (not yet on disk)
├─ CLAUDE.md                 # AI-agent guardrails
├─ project_details.md        # full project description (non-authoritative)
└─ REPOSITORY_STRUCTURE.md   # repository constitution: module shape, boundaries, rules
```

## Documentation

- **[project_details.md](project_details.md)** — full project description, modules, invariants, lifecycle.
- **[REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md)** — repository constitution (module shape, ownership, forbidden patterns).
- **[CLAUDE.md](CLAUDE.md)** — guardrails for AI coding agents.
- **[generatedDocs/](generatedDocs/)** — the frozen architecture corpus (authoritative source of truth).

> On any conflict, the frozen documents in `generatedDocs/` win. The files above are
> non-authoritative orientation and are patched to match the corpus.

---

## Contributing

This is a governed codebase. Before contributing:

1. Read [CLAUDE.md](CLAUDE.md) and [REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md).
2. Confirm your change sits inside **one module** and respects "one module, one owner."
3. Never edit a frozen document — propose **additive patches** only.
4. AI-generated code requires AI Coding Supervisor or human review before merge;
   architecture-affecting changes require **human** approval.

---

*© iVendorz — Industrial Procurement Hub & Operating System for Bangladesh.*
