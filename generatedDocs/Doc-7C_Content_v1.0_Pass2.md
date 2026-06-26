# Doc-7C — App Shell & Data Layer — **Content Pass-2 (§5–§9 + Appendix)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 + Appendix of `Doc-7C_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7C FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7C_Structure_v1.0_FROZEN` §5–§9 + Appendix; SR5 (§5) · SR6 (§6) · SR7 (§7) · SR8 (§8) · SR9/SR10 (§9) |
| Carries forward | Pass-1 §3/§4 (server-validated context) · `Doc-7A §3.7` wired-only |
| Posture | Reference-never-restate; mechanism only. Coins **nothing** (envelope/error/pagination/header by pointer) |

> **Scope:** the data layer + shell services — the server-side typed wired Doc-5 API-client (§5), the global notification center (§6), loading/error/streaming/not-found conventions (§7), the out-of-frontend boundary (§8), conformance & carried items (§9), and the shell/route-group skeleton (Appendix).

---

## §5 — Typed Wired Doc-5 API-Client — server-side *(mechanism only)*

### §5.1 Server-side execution (SR5; `Doc-7A §3.3/§3.4/§3.7`)
The typed Doc-5 API-client **executes in the Next.js server layer** — Server Components for reads, server actions / route handlers for writes. The **browser never invokes a Doc-5 contract directly, holds no service credential, and never sets the `Iv-Active-Organization` header itself**; the server attaches the **server-validated** active-org context (Pass-1 §4). **Client Components trigger server actions only**; they do not call Doc-5.

### §5.2 Wired-only boundary (`Doc-7A §3.7`)
The client binds **only the caller-facing wired** subset of the frozen Doc-5 surface. **Out-of-wire / internal-service contracts are never client-callable** (e.g. `check_permission` `Doc-5C §C3`, `resolve_entitlements`/`enforce_quota` `Doc-5I §10`). Cross-module access is via the wired `contracts/` surface only (One Module, One Owner).

### §5.3 Read path
Reads are Server-Component fetches of wired read/list contracts. The client consumes:
- the **success envelope** (`Doc-5A §5.6`): the owning module's representation **by reference** (never reshaped — `Doc-4A §10.1`) + the **top-level `reference_id`** (`Doc-4A §22.1 C-05`).
- **cursor pagination** (`Doc-5A §8`): query params `page_size` + opaque `cursor` (= prior `page_info.next_cursor`, never constructed/decoded); `page_size` bounded by the POLICY key `*.list_page_size_max` (`Doc-3 §12`), never a literal; offset/page-number forbidden.

### §5.4 Write path
Writes are **server actions** (or route handlers) calling wired command contracts. The client attaches:
- the **server-validated `Iv-Active-Organization`** header (§5.1; never client-set), and
- a **stable idempotency key per logical submission** (`Doc-7A §5.6`) — generated once, reused across retries/reconciliations within `*.idempotency_dedup_window` (`Doc-3 §12`); a new key only for a genuinely new submission.

### §5.5 Error consumption (branch on class)
Errors are consumed as the frozen error body (`Doc-5A §6.2`): `{ error{ error_class, error_code, message, field_errors?, retryable }, reference_id }`. The client surfaces these to the calling surface/segment, which **branches on `error.error_class` / `error_code`, never on HTTP status alone** (`Doc-4A §12.3`); the class→state mapping and remediation (incl. CONFLICT→refresh+retry vs STATE→re-derive) are `Doc-7A §5.3`/§7. The client **invents no error class/code/status** — an undeclared failure is a contract gap → flag-and-halt (`[ESC-7-API]`).

### §5.6 The client is the single data-access seam
All surface data access flows through this client; **no surface fetches a Doc-5 contract by an ad-hoc path**. This concentrates the wired-only rule, the header attach, idempotency, pagination, and error consumption in one realized layer the surfaces consume.

---

## §6 — Global Notification Center *(mechanism only)*

### §6.1 Defined here, composes Doc-7B primitives (SR6; Doc-7A allocation table)
The **global notification center is defined in Doc-7C** (the cross-cutting shell slot), **composing Doc-7B presentational primitives** (toast, list-item, badge-count). It mounts in a **root shell slot** (Pass-1 §2.2). Its **contract owner is M6** (`Doc-5H`); surfaces consume it via the slot and **never re-implement it** (`CHK-7-005`).

### §6.2 Renders M6 reads via the server-side client
The notification center renders **M6 `Doc-5H` notification reads** fetched through the §5 server-side client (wired-only). Marking-read / dismiss actions are **server actions** to the wired M6 commands (§5.4).

### §6.3 Non-disclosure-bound (`CHK-7-040`; `Doc-7A §8`)
The notification center is **non-disclosure-bound**: it **never surfaces an excluded/protected signal** (e.g. a notification that would reveal buyer-private exclusion or a non-disclosed fact). It renders only what the wired M6 read discloses — which is itself non-disclosure-bound — and adds no inference.

### §6.4 Realtime as transport
Live notification updates may arrive via **Supabase Realtime** (a transport, §8) — a Realtime event prompts a **re-fetch** of the wired M6 read (`Doc-7A §7.2`), never becoming the source of truth.

---

## §7 — Loading / Error / Streaming / Not-Found Conventions *(mechanism only)*

Realize the route-segment conventions every surface inherits (SR7; reusing the Doc-7B status primitives):

| Convention | Realization | Rule |
|---|---|---|
| **Loading** | route-segment suspense boundary; renders the Doc-7B skeleton/loading primitive during streamed RSC reads | presentation; no data |
| **Error** | route-segment error boundary; renders the Doc-7B error-state primitive from `error.error_class`/`message` (§5.5) | **no protected enrichment** (`Doc-7A §5.4`) |
| **Streaming** | RSC streaming with nested suspense; progressive render | performance (§8) |
| **Not-found** | route-segment not-found boundary; renders the Doc-7B not-found primitive **byte-identical to genuine absence** | no distinction "forbidden" vs "absent" in copy/layout/timing/telemetry (`Doc-7A §8.2`) |

The shell wires these at the segment level; surfaces inherit them and may add segment-specific boundaries, never weakening the non-disclosure rules.

---

## §8 — Out-of-Frontend Boundary *(boundary statement)*

### §8.1 No authoritative state (SR8; `Doc-7A R12`)
The shell and the API-client hold **no authoritative state** — only ephemeral view/interaction state and a **disposable** client cache (invalidated/refetched, never source of truth).

### §8.2 Files, realtime
- **Blobs transfer directly to/from Supabase Storage** (via a signed-URL or equivalent grant the wired contract issues); the wired contract carries the **`file_ref` only, never the binary** (`Doc-2 §9`; SR8). The shell never routes a blob through a Doc-5 contract.
- **Supabase Realtime** is a **transport** that prompts a re-fetch/reconcile against the authoritative wired read (`Doc-7A §7.2`), never a store.

### §8.3 Flag-and-halt
If the shell or client cache is proposed as the authoritative owner of business state, or a blob is proposed to flow through a Doc-5 contract, **flag-and-halt** (`Doc-7A R12`/§11).

---

## §9 — Conformance (Applicable Appendix A Subset) & Carried Items

### §9.1 Applicable `CHK-7-xxx` subset (SR9)
| CHK | Status (Doc-7C) | Reason |
|---|---|---|
| `CHK-7-001/002/003/004` | **APPLIES** | the typed client realizes contract-binding / cursor pagination / idempotency / error mapping (§5) |
| `CHK-7-005` | **APPLIES** | composes shared embedded components incl. the notification center it **defines** (§6) |
| `CHK-7-010/011/012` | **APPLIES** | the shell owns the active-org/authz boundary, Hybrid mount, Admin no-org (Pass-1 §3/§4) |
| `CHK-7-040` | **APPLIES** | scoped to the notification center (§6.3) |
| `CHK-7-041` | **APPLIES** | the shell not-found boundary ≡ absence (§7) |
| `CHK-7-070/071` | **APPLIES** | out-of-frontend / disposability (§8) |
| `CHK-7-080/081` | **APPLIES** | realize-never-redecide (SR10, §9.3) |
| `CHK-7-020/021` | **N/A** | Content≠Presentation is the kit's/surfaces' |
| `CHK-7-030/031` | **N/A** | no lifecycle screen in the shell |
| `CHK-7-042` | **N/A** | per-surface list non-disclosure — surfaces' (the shell's list mechanics in §5.3 inherit the contract's exclusion set) |
| `CHK-7-050/051` | **N/A** | AI panel — kit/surfaces |
| `CHK-7-060/061/062/063` | **N/A** | baseline — kit's |

### §9.2 Carried items
`DR-7-SHELL` (Doc-7C frozen after 7B, before surfaces) · `DR-7-API` (typed client consumes the frozen wired surface; `[ESC-7-API]` on a gap) · `DR-7-STATE` (segments wired; transitions are surfaces') · `[ESC-7-API]` · `[ESC-7-POLICY]`. Resolved only via named channels.

### §9.3 Coins nothing
Header/envelope/error/pagination/idempotency bound by pointer; route-group/segment/slot names are routing vocabulary (Appendix). No domain/API element introduced (SR10).

---

## Appendix — Shell / Route-Group Skeleton *(names = routing vocabulary; instantiated with the code)*

> Names are routing/wiring vocabulary (the legitimate *how* Doc-7 owns); they coin nothing in Doc-2/3/4/5.

- **Route groups:** `(public)` (anonymous — Doc-7D) · `(auth)` (auth-entry: login/signup/recovery — Doc-7E screens) · `(app)` (authenticated, session + active-org — Doc-7E account / Doc-7F Buyer / Doc-7G Vendor) · `(admin)` (Admin, no active-org — Doc-7H).
- **Root layout + shell slots:** navigation · org-switcher (§4) · notification center (§6).
- **Data layer:** the server-side typed wired Doc-5 API-client (§5); the `src/server/` wiring (`auth/`·`context/`·`authz/`·`guards/` — Pass-1 §3.2).
- **Segment conventions:** loading / error / not-found boundaries per route segment (§7).

Exact segment paths, layout files, and client shape are realized with the implementation; Doc-7C fixes the **topology + conventions**, not the code.

---

## Pass-2 self-check (pre-review)

- **Server-side client:** §5.1 — browser never calls Doc-5 / holds creds / sets header (carries structure MAJOR-1 fix).
- **Wired-only:** §5.2 — out-of-wire never client-callable.
- **Notification center conformance:** §6 matches Doc-7A allocation (defined here, composes 7B primitives, non-disclosure-bound, M6-owned).
- **Coins nothing:** envelope/error/pagination/header by pointer; Appendix names are routing vocabulary; 0 new module/contract/route-as-API/field/header/permission/POLICY key.
- **§9.1 vs SR9:** applicability table matches the frozen structure SR9 exactly.
- **Open for review:** confirm `CHK-7-042` N/A rationale (the shell's §5.3 list mechanics inherit the contract exclusion set — does the shell carry any list-non-disclosure obligation?); confirm the Appendix route-group names coin nothing (routing vocabulary only).

*End of Content Pass-2 (§5–§9 + Appendix) — DRAFT. Realizes `Doc-7C_Structure_v1.0_FROZEN` §5–§9 + Appendix. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7C FROZEN.*
