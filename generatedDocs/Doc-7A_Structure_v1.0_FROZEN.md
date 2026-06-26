# Doc-7A — Frontend Realization Metastandard — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26). Effective = `Doc-7A_Structure_Proposal_v0.1` + `Doc-7A_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-7 — Frontend Realization** (presentation sibling of Doc-5 API / Doc-6 Database; realizes the frozen Doc-5 API surface + Doc-4M state machines as Next.js App Router UI) |
| Document | **Doc-7A** — the frontend realization **metastandard**. Governs Doc-7B…7H via Appendix A (`CHK-7-xxx`), as Doc-5A governs Doc-5B…5M and Doc-6A governs Doc-6B…6K |
| Realizes | Frozen **Doc-5 API surface** (`Doc-5A…5K` SERIES_FROZEN) · **Doc-4M** state machines · **Doc-2 v1.0.3** §6 tenancy / §7 permissions / §0.4 currency · **Doc-3** §12 POLICY keys — on Next.js 15 App Router + React + Tailwind + shadcn/ui |
| Authority | `Doc-5_Program_Governance_Note_v1.0` (§1 · §3 · §8 rule 5); the frozen corpus governs (Master Architecture · ADR · Doc-2 · Doc-3 · Doc-4A…4M · Doc-5A…5K). Implementation Contract layer, below Doc-4/Doc-5, beside Doc-6 |
| Consistency obligation (not conformance) | Doc-7 surfaces MUST be **consistent with the frozen Doc-5 API surface** (every screen read/write/list served by a frozen Doc-5x contract). **Doc-5A has no conformance authority over Doc-7** (governance §8 rule 5); the *what*-authorities are the frozen Doc-5 contracts + Doc-4M (lifecycle) — **conformance-bearing because upstream/rank-0** — while Doc-5A is a *sibling* layer (consistency only) |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ POLICY patches v1.0–v1.8), Doc-4A v1.0, Doc-4L v1.0, Doc-4M v1.0, Doc-5A v1.0 (consistency, not conformance) + Doc-5B…5K |
| Contains | Structure only — surface-based program partition, R-set R1–R12, §-spine §0–§12 + Appendix A skeleton, carried dependencies. **No JSX / component code / routes / layouts / design tokens / screens** — those land in Doc-7A content passes + Doc-7B…7H |
| Program note | Doc-7 introduces **no module, ownership boundary, governance signal, state transition, permission slug, event, audit action, POLICY key, API contract, route, or field**. It realizes frozen Doc-5 contracts + Doc-4M states as composed UI. On any gap: **flag-and-halt**, escalate for a human-approved additive patch at the owning document — never coin, never resolve locally |

**Two governing rules:**

1. **Realize, never re-decide.** Doc-5 fixed *what* the API surface is; Doc-4M fixed *what* the lifecycles are; Doc-2 fixed *what* the tenancy/permission/currency rules are — all FROZEN. Doc-7 realizes *how* those become composed, navigable UI on Next.js App Router, and re-decides nothing in Doc-2/3/4/5.
2. **Consistency is an obligation; conformance authority is the frozen Doc-5 surface + Doc-4M.** Doc-7 must be consistent with the frozen Doc-5 surface and conform to Doc-4M/Doc-2 (upstream), and passes Appendix A (`CHK-7-xxx`) before any per-document freeze. It coins no contract, route, field, permission slug, state, event, audit action, or POLICY key.

---

## Ratified decisions (R-set R1–R12)

- **R1 — Program shape: a metastandard + surface-partitioned realizations.** Doc-7 = **Doc-7A** (this metastandard) + realization documents partitioned **by frontend surface/actor** (Doc-7B…7H), each staged-freeze, gated by Appendix A. The partition **departs from the Doc-5/Doc-6 backend-module letter map by intent** — the UI is not decomposed by backend module (a single route renders many modules' content); partitioning by deployable surface/route-group (mapping to the Doc-5 tri-actor model: Public / User / Admin) keeps each surface document whole. **Cross-cutting shared documents (Doc-7B Design System, Doc-7C App Shell & Data Layer) freeze before the surfaces that consume them.** *(Alternative — per-backend-module partition — rejected: it splits one deployable surface across many documents.)*
- **R2 — Realize-never-redecide; the frozen Doc-5 surface + Doc-4M + Doc-2 are the *what*-authorities.** Every screen binds to a frozen Doc-5x contract by pointer; every lifecycle UI binds to a Doc-4M state machine by pointer; every tenancy/permission gate binds to Doc-2 §6/§7 by pointer. Physical UI choices (component tree, layout, interaction/visual design, optimistic-update strategy) are the only new decisions and MUST NOT change domain meaning or invent a contract/state/permission. **Doc-4M is rank-0 frozen architecture (upstream — the UI *conforms* to it); Doc-5A is a sibling Implementation-Contract layer with no conformance authority over Doc-7 (consistency only — §8 rule 5): conform to Doc-4M/Doc-2; stay consistent with the Doc-5 contract surface.** Gaps → `[ESC-7-*]`, escalated to the owning document, never invented.
- **R3 — Stack realization = the fixed Master-Architecture frontend stack.** Realize Next.js 15 App Router + React + Tailwind + shadcn/ui (Master Architecture / CLAUDE.md §2; exact pins in `package.json` once code exists). Server Components default; client components only where interaction requires; **server actions / route handlers are the write path** to frozen Doc-5 contracts. The component-kit boundary is realized in Doc-7B. No stack element coined or re-decided.
- **R4 — Consistency with the frozen Doc-5 API surface (not conformance to Doc-5A).** Every read/write/list maps to a frozen Doc-5x contract: list views consume cursor pagination (`Doc-5A §8`) bounded by `*.list_page_size_max` (Doc-3 §12, by pointer, never a literal); mutations honor `*.idempotency_dedup_window`; error rendering maps the `Doc-5A §6.2` taxonomy (no invented error). The typed API-client (Doc-7C) binds to the frozen contracts. Surfaced as `[ESC-7-API]` only where a screen needs data no frozen Doc-5 contract provides (flag-and-halt; Board → additive Doc-5x patch — never local; §8 rule 5).
- **R5 — Content ≠ Presentation (Invariant #9 / Golden Rule #4).** Strict separation of authoritative **content** (module-owned, contract-fetched) from **presentation** (layout, theme, microsite skinning, display ordering). Presentation never mutates/caches-as-authoritative/stands-in-for content; a vendor microsite renders M2 content but owns no authoritative data (the **same M2 microsite content is rendered read-only by the Public surface and managed by the Vendor workspace — two surfaces, one M2 owner**). **Display sort/filter is presentation over the contract result set, never a re-rank of governed M3 matching** (`Doc-5E`); the UI displays, never re-scores. Realized via the Doc-7B presentation boundary + per-surface composition.
- **R6 — Users Act, Organizations Own (Invariant #5) — active-org context.** Every authenticated surface resolves the **active organization context server-side**; client org ID is **never trusted** (CLAUDE.md §5). Realized in the App Shell (Doc-7C) as the server-resolved context boundary; surfaces consume it, never re-derive it. **A surface is a route-group/capability, not a per-user exclusive app:** one user under one active org may mount Buyer **and** Vendor workspaces where Platform Participation is Hybrid (Invariant #2); the App Shell composes the navigable surface set from platform participation + org role.
- **R7 — Authorization is app-layer; the UI gate is UX, not the model (CLAUDE.md §2).** The frontend gates navigation/actions on Doc-2 §7 permission slugs (by pointer) for **UX only**; **the server re-validates every action** — UI gating is never the authorization boundary. The UI reads **entitlements (M7) and permissions (M1) via contracts**, never plan-name/role-name string checks (Invariant #10; `Doc-5I R10`). No permission slug or entitlement key coined.
- **R8 — Private Exclusion Stays Private (Invariant #11) — non-disclosure in the UI.** A blacklisted/excluded vendor's frontend experience is **byte-equivalent** to a non-matched vendor's: no surface, view, count, analytic, notification, or error reveals buyer-private exclusion (`buyer_vendor_statuses`) or link suggestions. The buyer-private CRM (M4) renders **only inside the buyer's own workspace**. Realized as a per-surface obligation (Doc-7F/7G) + an Appendix A check; the Vendor workspace (Doc-7G) carries the load-bearing byte-equivalence attestation.
- **R9 — State-machine-driven UI (Doc-4M authority).** Every lifecycle surface renders state + available transitions **strictly from the Doc-4M state machine**: only machine-permitted, actor-permitted transitions are offered; no invented transition/state/label. Optimistic UI **reconciles to the server's authoritative state**; the UI displays state, the server owns it. No state or edge coined.
- **R10 — AI Suggests, UI Surfaces, Modules Decide (Invariant #12).** AI artifacts (M9 — `Doc-5K`) render **only as labeled advisory surfaces**; never auto-committing a decision, never authoritative. `ai.*` reads are regenerable/TTL projections (`Doc-5K R7`), never a UI source of truth. **No AI surface gates a procurement or governance decision.**
- **R11 — Accessibility, i18n, currency & performance baseline.** Inherit from Doc-7B: WCAG-AA + keyboard/focus; **i18n / localization-readiness — the locale set is a product requirement, not fixed by Doc-7** (localized copy is presentation; authoritative data is module-owned); **currency displayed per value field, default BDT, never assumed** (Doc-2 §0.4); responsive breakpoints; the App Router performance contract (RSC streaming, suspense, image/font optimization). Coin no domain element.
- **R12 — Out-of-frontend boundary.** The frontend owns **no authoritative state** (ephemeral view/interaction state only). File uploads → Supabase Storage via the contract-mediated path (UI holds `file_ref`, never blobs); Supabase Realtime = transport, not store; client data caches = **disposable projections, never source of truth**. **Flag-and-halt if any UI component is proposed as the authoritative owner of business state.**

---

## Program partition (surface-based)

| Doc-7 document | Surface / scope | Primary Doc-5 sources | Realizes |
|---|---|---|---|
| **Doc-7A** (this doc) | — (metastandard) | — | Cross-cutting frontend realization conventions + the `CHK-7-xxx` freeze gate |
| **Doc-7B** | Design System & Component Kit *(frozen first)* | — (R5) | shadcn/ui component kit, design tokens/theme, presentation-component boundary, a11y/i18n/currency/responsive baseline; the shared kit every surface consumes; defines the shared embedded components (trust badge, billing indicator, AI panel, thread presentation) |
| **Doc-7C** | App Shell & Data Layer *(frozen second)* | `Doc-5A`, `Doc-5C` | App Router skeleton (route-group topology, layouts), the **active-org context boundary + org-switcher control + session/auth boundary** (R6), the typed API-client over the frozen Doc-5 surface (R4), the **global notification center** (M6 read), error/loading/streaming conventions |
| **Doc-7D** | Public Surface (anonymous) | `Doc-5D` | Anonymous marketplace discovery, vendor microsites & public profiles, public category/product browse, **ads read** (no favorites — favorites are membership-only); Content≠Presentation load-bearing (R5) |
| **Doc-7E** | Account & Identity Shell | `Doc-5C`, `Doc-5I` | Auth flows, **membership/role/delegation management screens**, subscription/plan/account & platform-invoice views; Users-Act/Orgs-Own load-bearing (R6) |
| **Doc-7F** | Buyer Workspace | `Doc-5E` (buyer), `Doc-5F` (buyer ops), `Doc-5D` (buyer discovery) | Discovery → RFQ authoring → routing/invitations → quotation comparison → award → post-award operations → buyer-private CRM; the moat surface; buyer-private CRM non-disclosure (R8); membership-scoped favorites |
| **Doc-7G** | Vendor Workspace | `Doc-5E` (vendor), `Doc-5D` (vendor presentation), `Doc-5F` (vendor ops) | Invitation inbox, quotation authoring/versioning, vendor profile & microsite management, lead pipeline; **byte-equivalence non-disclosure load-bearing** (R8 — blacklist undetectable) |
| **Doc-7H** | Admin Console | `Doc-5J` + cross-module Admin reads | Moderation, verification tasks, bans, category/vendor approval, import, config policy; Admin-decides/owning-module-owns; **no active-org context** (Admin not org-scoped) |

### Cross-surface embedded-component allocation (single defining owner; no surface re-implements)

| Embedded component | Defining document | Composing surfaces | Contract owner |
|---|---|---|---|
| Trust badge / score chip (read) | Doc-7B | 7D, 7E, 7F, 7G, 7H | M5 `Doc-5G` |
| Global notification center | Doc-7C | all authenticated (7E–7H) | M6 `Doc-5H` |
| RFQ / quotation conversation thread | Doc-7B (presentation) + Doc-7C shell slot | 7F, 7G | M6 `Doc-5H` |
| Billing / entitlement indicator | Doc-7B | 7E (primary), 7F/7G (hints) | M7 `Doc-5I` |
| AI advisory panel | Doc-7B | per surface (7D read · 7F/7G advisory) | M9 `Doc-5K` |

**Binding rule:** a shared embedded component is **defined once** in its defining document and **composed** by surfaces — **no surface re-implements it**; the **contract owner is the module (`Doc-5x`) regardless of where it renders**. No module's UI is orphaned (M5/M6/M7/M9 each single-owned above). Unresolved standalone-vs-embedded allocations carry `[ESC-7-DESIGN]`.

*Doc-7A authors no surface. §0–§12 are cross-cutting conventions; per-surface screens are realized in Doc-7B…7H against them.*

---

## Section spine (authored in the Doc-7A content passes)

- **§0 Document Control, Precedence & Consistency Obligation** — precedence chain (… → Doc-5A…5K → Doc-7A → Doc-7B…7H → Code); realize-never-redecide; consistency-with-Doc-5 (§8 rule 5; Doc-4M/Doc-2 conform-upstream); flag-and-halt; the two per-surface freeze obligations (Appendix A + clear `[ESC-7-*]`). Deps: governance §1/§3/§8 rule 5; Doc-2 §0.
- **§1 Scope, Audience & Program Partition** — what Doc-7A governs vs Doc-7B…7H; surface partition + embedded-component allocation; `DR-7-*`/`[ESC-7-*]` register. Deps: Doc-5A; Doc-4M; governance §1.
- **§2 Frontend Realization Stack & Authority Binding** — Next.js 15 App Router/React/Tailwind/shadcn (R3); *what* = frozen Doc-5 + Doc-4M; *how* = Doc-7; Doc-5A = consistency cross-check (§8 rule 5); RSC-default / client-where-needed / server-actions-write. Deps: CLAUDE.md §2; Doc-5A; Doc-4M.
- **§3 Cross-Cutting Composition & Routing Conventions** *(mechanism)* — route-group topology, layout boundaries, RSC/client boundary, server-actions write path, loading/error/streaming; canonical terms **surface · route · view (= screen) · component**. Deps: CLAUDE.md §2; Doc-5A §5.6/§8.
- **§4 Active-Org Context & App-Layer Authorization** *(mechanism)* — server-resolved active-org (client org ID never trusted); **7C owns the context boundary/switcher mechanism, 7E owns the management screens** (no Doc-5C contract realized twice); Hybrid mounts Buyer+Vendor (Invariant #2); UI permission/entitlement gate = UX over the server boundary (Doc-2 §7 by pointer; M7/M1 via contract, not name-string — Invariant #10); authorization is app-layer. Deps: Doc-2 §6/§7; CLAUDE.md §2/§5; Doc-5C; Doc-5I R10.
- **§5 Data-Binding & API-Client Conventions** *(mechanism)* — typed client over frozen Doc-5; read (RSC) / write (server actions); cursor pagination + `*.list_page_size_max`; idempotency `*.idempotency_dedup_window`; error→UI mapping (`Doc-5A §6.2`); envelope (`§5.6`); `[ESC-7-API]` on unservable need. Deps: Doc-5A §5.6/§6.2/§8; Doc-3 §12; Doc-5B…5K.
- **§6 Content ≠ Presentation Realization** *(mechanism)* — presentation boundary; microsite case (M2 across Public read + Vendor manage); display sort/filter never re-ranks M3. Deps: Doc-2; Doc-5D/Doc-5E.
- **§7 State-Machine-Driven UI Realization** *(mechanism)* — Doc-4M-permitted transitions only; optimistic reconcile to server; no edge coined. Deps: Doc-4M; the Doc-5x command contracts.
- **§8 Non-Disclosure & Privacy Realization** *(mechanism)* — byte-equivalence (excluded ≡ non-matched); buyer-private CRM never leaks; per-surface obligation (7F/7G). Deps: Doc-2 §6; Doc-5E/Doc-5F; Invariant #11.
- **§9 AI Advisory Surface Realization** *(mechanism)* — labeled advisory, non-authoritative, non-gating; `ai.*` regenerable (`Doc-5K R7`). Deps: Doc-5K; Invariant #12.
- **§10 Accessibility, i18n, Currency & Performance Baseline** *(mechanism)* — WCAG-AA; i18n-readiness (locale set = product requirement, not coined); currency-per-field default BDT (Doc-2 §0.4); responsive; RSC streaming. Deps: Doc-2 §0.4; CLAUDE.md §2; Doc-7B.
- **§11 Out-of-Frontend Boundary** — R12; no authoritative client state; Storage `file_ref`/Realtime/cache disposable; flag-and-halt. Deps: CLAUDE.md §2; Doc-2 §9.
- **§12 Conformance & Carried Items** — Appendix A self-check; `DR-7-*` + `[ESC-7-*]` register by pointer; per-surface freeze obligation. Deps: Appendix A; governance §6/§8.

---

## Appendix A — Doc-7 Frontend Realization Conformance Checklist (`CHK-7-xxx`) — per-surface freeze gate

Bands (check IDs assigned at content):

- **Contract-binding** — every read/write/list maps to a frozen Doc-5x contract; cursor pagination per `Doc-5A §8`; page-size via `*.list_page_size_max`; idempotency on mutations; errors per `Doc-5A §6.2`; nothing coined (R2/R4).
- **Active-org/authz** — active-org server-side; client org ID never trusted; UI gate = UX over server re-validation; entitlement/permission via contract not name-string; Hybrid mounts both workspaces (R6/R7).
- **Content≠Presentation** — presentation owns no content; display sort/filter never re-ranks M3; microsite is M2-owned across surfaces (R5).
- **State-machine** — lifecycle UI offers only Doc-4M-permitted transitions; optimistic UI reconciles to server; no state/edge coined (R9).
- **Non-disclosure** — vendor experience byte-equivalent (excluded ≡ non-matched); buyer-private CRM never leaks; no exclusion signal in any view/count/notification/error (R8).
- **AI-advisory** — AI surfaces labeled advisory, non-authoritative, non-gating; `ai.*` regenerable projection (R10).
- **Baseline** — WCAG-AA, keyboard/focus, currency-per-field (default BDT), i18n-ready, responsive, RSC streaming (R11).
- **Out-of-frontend** — no authoritative client state; blobs via Storage `file_ref`; Realtime/cache disposable (R12).
- **Realize-never-redecide** — no contract/route/field/permission/state/event/audit action/POLICY key coined; every element traces to a Doc-5/Doc-4M/Doc-2/Doc-3 pointer; gaps `[ESC-7-*]`, escalated (R2).

---

## Open carried items (resolved only via named channels)

| ID | Item | Handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Doc-7B + Doc-7C are cross-cutting; every surface consumes them | Frozen before surfaces (R1); referenced by pointer, never re-authored | No |
| **DR-7-API** | Frozen Doc-5 surface must be UI-consumable | Consistency cross-check (R4); `[ESC-7-API]` only where unservable — flag-and-halt | No (per-surface cross-check) |
| **DR-7-STATE** | Doc-4M drives every lifecycle UI | Bound by pointer; only machine-permitted transitions (R9) | No |
| `[ESC-7-API]` | A screen needs data/action no frozen Doc-5x provides | Additive Doc-5x patch (Board, human-approved; precedent `Doc-4I_ActivatePlan_Additive_Patch`); never local (§8 rule 5) | Per-surface: possible |
| `[ESC-7-POLICY]` | A UI need referencing an unregistered POLICY key | Additive `Doc-3 §12.2` patch (precedent v1.0–v1.8); never coined | Per-surface: possible |
| `[ESC-7-DESIGN]` | A cross-surface embedded-component allocation needing ratification | Doc-7B owns the shared component; allocation resolved per-surface at content; never coined here | Per-surface: possible |

## Fences / out of scope

Authoring any surface's components/JSX/routes/layouts/screens (Doc-7B…7H content) · other infrastructure layers (API = Doc-5; DB = Doc-6; Tests = Doc-8) · resolving `DR-7-*`/`[ESC-7-*]` locally · coining any API contract, route, field, permission slug, entitlement key, state, edge, event, audit action, or POLICY key · changing any frozen Doc-2/3/4/5 declaration, module ownership, governance signal, or invariant · giving any UI component authoritative business state (R12) · placing authorization in the UI as the model rather than the server backstop (R7) · re-ranking governed M3 matching in the UI (R5) · displaying AI output as authoritative or decision-gating (R10) · the frontend **test** obligation (Doc-8 — component / e2e / a11y / visual-regression).

---

*End of Doc-7A Canonical Structure **v1.0 FROZEN**. Effective = Proposal v0.1 + Patch v0.1.1; Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR). Doc-7 realizes the frozen Doc-5 API surface + Doc-4M state machines as Next.js App Router UI; conforms to Doc-4M/Doc-2 (upstream); consistent with the Doc-5 contract surface (not conformant — governance §8 rule 5); coins nothing. Next: Doc-7A content passes (§0–§12 + Appendix A check IDs), each through the Board loop.*
