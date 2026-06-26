# Doc-7C — App Shell & Data Layer — **Content Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-7C_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7C_Structure_v1.0_FROZEN` §0–§4; SR1 (§1) · SR2 (§2) · SR4 (§3) · SR3 (§4) |
| Authority | Conforms to `Doc-7A_SERIES_FROZEN_v1.0` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5 wired surface |
| Posture | Reference-never-restate; **mechanism only — no route files, no layout code, no provider code**. Coins **nothing** (header/contracts by pointer; route-group/segment names = routing vocabulary) |

> **Scope:** the shell foundation — document control & gating (§0), the shell's place (§1), the App Router route-group topology & layouts (§2), the session & auth boundary (§3), and the active-org context & org-switcher (§4). §5–§9 + Appendix (typed client, notification center, segment conventions, out-of-frontend, conformance, skeleton) land in Pass-2.

---

## §0 — Document Control, Precedence & Gating

### §0.1 Precedence & conformance
Doc-7C is a Doc-7 surface-layer realization document. It **conforms to** `Doc-7A` (its metastandard) and to Doc-4M/Doc-2 (upstream); it is **consistent with** the frozen Doc-5 wired surface (the typed client binds wired contracts). Precedence: `… → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code` (Doc-6 and Doc-7 are siblings at the Implementation Contract layer; neither governs the other). On any conflict the higher document wins and Doc-7C is corrected.

### §0.2 Realize-never-redecide
Doc-7C realizes Doc-7A's composition/active-org/data-binding conventions (§3/§4/§5/§3.7/§3.5) as the deployable shell + data layer. It re-decides nothing and **re-authors no Doc-5 contract**. The only new decisions are routing/wiring choices (route-group tree, layout boundaries, provider placement, the typed-client shape); these coin no domain/API element (SR10).

### §0.3 Flag-and-halt
Where the shell would need a contract / header / POLICY key that does not exist in the frozen corpus, Doc-7C **halts and escalates** — `[ESC-7-API]` (additive Doc-5x patch, Board) / `[ESC-7-POLICY]` (additive `Doc-3 §12.2` patch) — never invents (`Doc-5 Governance Note §7`).

### §0.4 Freeze obligation
Doc-7C passes the **applicable subset** of `Doc-7A` Appendix A (SR9) — checks outside its scope are marked **N/A with reason** — and clears any carried `[ESC-7-*]` before freeze (governance §8 rules 1, 3).

---

## §1 — Scope & the Shell's Place *(authors no surface)*

### §1.1 What Doc-7C is
Doc-7C is the **App Shell & Data Layer** — the deployable skeleton every surface mounts into (SR1). It owns: the App Router route-group topology + root/segment layouts (§2), the session & auth boundary (§3), the server-resolved active-org context + org-switcher (§4), the **server-side typed wired Doc-5 API-client** (§5), the global notification center (§6), and the shared loading/error/streaming/not-found conventions (§7).

### §1.2 What Doc-7C is not
It **authors no surface, view, or screen** (those are Doc-7D…7H) and **no component kit, token, or theme** (that is Doc-7B). It **re-authors no Doc-5 contract** — it binds the frozen **wired** subset via the typed client (§5). It owns the **frame and the data layer**, not the content of any surface.

### §1.3 Ordering — frozen second
Per `DR-7-SHELL`, Doc-7C freezes **after Doc-7B** (it composes Doc-7B primitives, e.g. into the notification center) and **before the surfaces** (Doc-7D…7H mount into it). Surfaces consume the shell **by reference**; none re-implements a shell slot or the client.

---

## §2 — Route-Group Topology & Layouts *(mechanism only)*

### §2.1 The four areas (SR2)
The App Router route-group tree realizes four areas mapping to the surface partition + the session model:

| Area | Auth state | Mounts | Active-org |
|---|---|---|---|
| **Public-marketplace group** | anonymous | Doc-7D (Public) | none |
| **Auth-entry routes** | unauthenticated | login / signup / password-recovery (Doc-7E authors the screens; Doc-7C owns placement) | none |
| **Authenticated group** | session required | Doc-7E (account) · Doc-7F (Buyer) · Doc-7G (Vendor) | **server-resolved** (§4) |
| **Admin group** | Admin session | Doc-7H (Admin console) | **none** (`Doc-7A §4.4`) |

You cannot hold a session while authenticating, so **auth-entry is distinct** from both the Public-marketplace group and the session-gated authenticated group.

### §2.2 Root layout & shell slots
The **root layout owns the shell slots** every authenticated surface mounts into: the **navigation**, the **org-switcher** (§4), and the **notification center** (§6). Surfaces fill the route-group; the shell owns the frame. Segment layouts compose per-area chrome (e.g. the authenticated group's layout establishes the session + active-org boundary before rendering any tenant surface).

### §2.3 RSC layouts
Layouts and the shell frame are **Server Components** by default (`Doc-7A §3.3`); interactive shell controls (org-switcher trigger, notification dropdown) are explicit **Client Components** holding only ephemeral UI state, invoking server actions for any mutation (§4/§6). Exact segment names are realized with the code; §2 fixes the **topology**, not the file tree.

---

## §3 — Session & Auth Boundary *(mechanism only)*

### §3.1 Authentication via Supabase Auth (authn only)
The authenticated session is established via **Supabase Auth — authentication only** (CLAUDE.md §2). Auth establishes *who the user is*; it does **not** decide *what they may do* — that is authorization (§3.3).

### §3.2 The server wiring
The shell composes the app-layer boundary from the `src/server/` layer (`REPOSITORY_STRUCTURE.md`): **`auth/`** (Supabase Auth integration), **`context/`** (server-validated active-org context — §4), **`authz/`** (app-layer permission-slug / delegation checks), and **`guards/`** (request guards composing auth + org context + permissions). The authenticated group's layout runs the guard before rendering any tenant surface.

### §3.3 Authentication ≠ authorization
**Authorization is app-layer** (`Doc-7A §4.3`; `src/server/authz/`), enforced inside each wired Doc-5 contract the surface calls (Pass-context: the contract runs its own authz). The shell establishes the session and hands the **server-validated** identity + active-org to surfaces; it **never trusts a client-supplied identity or org** (CLAUDE.md §5). The UI permission gate is UX only (§4.3 below).

---

## §4 — Active-Org Context & Org-Switcher *(mechanism only)*

### §4.1 Server-resolved active organization (SR3; `Doc-7A §4`/R6)
The active organization is resolved **server-side** and carried as the **`Iv-Active-Organization`** context header — **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`; CLAUDE.md §5). The shell:
- resolves the current context via **`get_active_context`** (`Doc-5C §C8`),
- lists switchable organizations via **`list_my_organizations`** (`Doc-5C §C8`),
- and the **org-switcher control** invokes **`switch_active_organization`** (`Doc-5C §C8`) through a server action; the new context is re-validated server-side, never asserted by the client.

### §4.2 The ownership seam (Doc-7C vs Doc-7E)
**Doc-7C owns the active-org context boundary + the org-switcher mechanism + the session**; **Doc-7E owns the management screens** (membership / role / delegation administration, account/subscription views). No `Doc-5C` contract is realized by both — the shell owns the *switcher mechanism*, Doc-7E owns the *management screens* (`Doc-7A §4` seam).

### §4.3 The navigable surface set & Hybrid
The shell composes the **navigable surface set** from the **organization's platform participation** (Buyer / Vendor / Hybrid — an org property, Master Architecture) + the **user's org role** (Owner/Director/Manager/Officer). Where participation is **Hybrid**, the shell mounts **Buyer (Doc-7F) and Vendor (Doc-7G) together** under one active org (`Doc-7A §4.2`; Invariant #2). The permission/entitlement gate on navigation is **UX over the server boundary** (`Doc-7A §4.3` / §3.3) — read via wired contracts, never name-string checks (Invariant #10).

### §4.4 Admin is not org-scoped
The Admin group (Doc-7H) carries **no active-org context** — no `Iv-Active-Organization` header (`Doc-7A §4.4`; `Doc-5A §7.3` via `Doc-5C R2`; `Doc-5J` Admin-only). §4.1's machinery applies to the authenticated tenant group (7E–7G), not to Admin.

---

## Pass-1 self-check (pre-review)

- **Mechanism only:** §0–§4 author no route file, layout, or provider.
- **Coins nothing:** header/contracts bound by pointer (`Iv-Active-Organization`, `get_active_context`, `list_my_organizations`, `switch_active_organization` all `Doc-5C §C8`; `Doc-4A §5.3`); 0 new module/contract/route-as-API/field/header/permission/POLICY key.
- **Server-side discipline:** §3.3/§4.1 — client never trusted; server-validated context handed to surfaces (carries SR4/SR3).
- **Conforms to Doc-7A:** four-area topology (§2), seam (§4.2), Hybrid (§4.3), Admin no-org (§4.4).
- **Open for review:** confirm §4.3 "platform participation is an org property" reads correctly vs Invariant #2's two role dimensions; confirm §3.2 server/ subfolders match `REPOSITORY_STRUCTURE.md` exactly.

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-7C_Structure_v1.0_FROZEN` §0–§4. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix).*
