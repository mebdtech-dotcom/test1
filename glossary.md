# iVendorz — Glossary (terminology normalization)

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — Glossary (non-authoritative companion; one meaning per term)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (foundation)
**Companions:** referenced by all design-wave docs; see [`shared_conventions.md`](shared_conventions.md)

---

## 0. Purpose

Each UI/IA/marketing term has **one canonical meaning** here, so overlapping words
(Category Explorer vs Industry Explorer vs Marketplace Search vs Catalog vs Taxonomy …) don't drift.
This **coins no domain concept** — domain terms remain owned by the frozen corpus; this records the
**presentation vocabulary** and points to the owner.

---

## 1. Discovery & taxonomy terms

| Term | Canonical meaning | Owner / pointer |
|---|---|---|
| **Industrial Category Explorer** (a.k.a. *Category Explorer*) | The public, 4-column synchronized taxonomy navigator (replaces the consumer "mega menu"). **Public surface only.** | UX §3.2 · IA §5.3 · gap `ESC-7-API-CATNAV` |
| **Industry Explorer** | A landing **section** that surfaces top-level **industries** as an entry into the Category Explorer. Not a separate taxonomy — industries are **not modeled** in the corpus (`ER`). | LP · GL "Taxonomy" |
| **Marketplace Search** (a.k.a. *Universal Search* on the landing command center) | Context-aware catalog/vendor search bound to `search_catalog` / `list_vendor_directory`. | UX §2.1 · IA §5.1 |
| **Catalog** | The set of vendor **products** discoverable via `search_catalog`. | M2 · Doc-5D |
| **Vendor Directory** | The browsable list of **vendors** via `list_vendor_directory`. | M2 · Doc-5D |
| **Taxonomy** | The **category** tree (Admin-governed). Industry/Brand/Standard/Manufacturer are **not modeled** (`ER`). | M2/M8 |
| **Microsite** | A vendor's **published** public presence (M2 projection); managed in Vendor workspace (draft), rendered read-only on Public. | M2 · IA §6.1/§6.4 |

## 2. Procurement terms

| Term | Canonical meaning | Owner / pointer |
|---|---|---|
| **RFQ** | Request for Quotation — the buyer demand record + state machine. | Doc-4M / Doc-4E |
| **Quotation** | A vendor's versioned response to an invitation. | Doc-4M / Doc-4E |
| **Invitation** | A System/engine-issued request to a vendor to quote (never buyer-issued). | Doc-3 / Doc-4E |
| **Comparison statement** | Read-only, System-generated decision support; **never recommends a winner**. | Doc-7F §6 · R6 |
| **Award** | The buyer's explicit, unranked, 1:1 selection (`award_rfq`). | Doc-2 §5.4 / Doc-3 §9.1 |
| **Engagement** | The post-award record created on award (`open → in_delivery → completed → closed`). | Doc-4F |
| **Trade invoice** | An inter-party Operations record (**not** a platform invoice; no funds custody). | Doc-4F · DF-6 |
| **Platform invoice** | A billing/platform-fee invoice (M7) — distinct from a trade invoice. | Doc-5I |

## 3. Identity & governance terms

| Term | Canonical meaning | Owner / pointer |
|---|---|---|
| **Active org** | The server-resolved tenant context (`Iv-Active-Organization`); never client-trusted. | Doc-7C §4 · Invariant #5 |
| **Participation** | Org-level role: Buyer / Vendor / Hybrid / Staff. | Invariant #2 |
| **Org role** | Owner / Director / Manager / Officer. | Invariant #2 |
| **Trust signals** | Trust Score · Capacity · Financial Tier · Performance Score (platform-wide, M5) + Buyer Vendor Status (private, M4). Firewalled. | CLAUDE.md §4 |
| **Declared tier** vs **Verified tier** | Vendor-declared financial tier vs M5-verified tier — never conflated. | M5 |
| **Byte-equivalence** | An excluded/blacklisted vendor's experience is byte-identical to a non-matched vendor's. | Invariant #11 · CHK-7-040 |
| **Command Center** | The landing-page floating "Industrial Procurement Command Center" (LP §2). Marketing/UI term. | LP |
| **Industrial Procurement Operating System** | The product's positioning phrase (CLAUDE.md §1). Marketing term. | CLAUDE.md §1 |

## 4. Realization & tooling terms

| Term | Canonical meaning | Owner / pointer |
|---|---|---|
| **UI Realization Framework** (`RF`) | The AI-tool-agnostic prompt-assembly layer: composes a production-quality UI-realization prompt for any `P-*` page by binding the design corpus (`H-001…H-004` + tokens/components/template/screen/context). Coins nothing. | `RF` |
| **Realization lifecycle** | `Prompt → AI UI → Board Review (Validate-Findings) → Freeze UI → Implementation` — the Board stays the designer; the AI never self-approves. | `RF §7` · CLAUDE.md §13 |
| **Provenance stamp** | A prompt's reproducibility line = `RF` version + bound-doc versions + Page ID; the same inputs reassemble the same prompt. | `RF §8` |
| **Prompt Generator** | Deferred Wave-3 tooling that materializes per-page prompts into a generated, gitignored dir (never hand-edited); does not fork `SS`. | `RF §9` |

---

*Non-authoritative. Conforms upward; coins no domain concept. On any conflict the frozen document wins.*
