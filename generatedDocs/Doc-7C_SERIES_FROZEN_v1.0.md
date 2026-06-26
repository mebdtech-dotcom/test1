# Doc-7C — App Shell & Data Layer — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit (incl. CC-1) all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7C** — the App Shell & Data Layer; second cross-cutting Doc-7 realization (**frozen second** per `DR-7-SHELL`, after Doc-7B, before surfaces) |
| Program | **Doc-7 — Frontend Realization** |
| Realizes | `Doc-7A_SERIES_FROZEN_v1.0` §3/§4/§5/§3.7/§3.5; defines the global notification center (composes Doc-7B primitives) |
| Gated by | `Doc-7A` Appendix A — applicable subset (SR9); conforms to the frozen `Doc-7A` allocation table |
| Coins | **Nothing** — header/envelope/error/pagination/idempotency by pointer; route-group/slot names are routing vocabulary |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7C_Structure_v1.0_FROZEN` (= `Doc-7C_Structure_Proposal_v0.1` + `Doc-7C_Structure_Patch_v0.1.1`) |
| Content §0–§4 | `Doc-7C_Content_v1.0_Pass1` + `Doc-7C_Content_Pass1_Patch_v1.0.1` |
| Content §5–§9 + Appendix | `Doc-7C_Content_v1.0_Pass2` + `Doc-7C_Content_Pass2_Patch_v1.0.1` + **CC-1** (`Doc-7C_Content_Freeze_Audit_v1.0`) |
| Freeze gates | `Doc-7C_Structure_Freeze_Audit_v1.0` · `Doc-7C_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7C_Structure_Independent_Hard_Review_v0.1` · `Doc-7C_Content_Pass{1,2}_Independent_Hard_Review_v1.0` |

---

## What Doc-7C fixes (summary — authoritative text is the effective set)

**Topology (SR2):** four areas — `(public)` anonymous · `(auth)` auth-entry (login/signup/recovery) · `(app)` authenticated (session + active-org) · `(admin)` (no active-org). Root layout owns the shell slots (nav · org-switcher · notification center). Doc-7E spans auth-entry (unauth) + account management (auth).

**Session & auth (SR4):** Supabase Auth (authentication only); `src/server/` auth/context/authz/guards; **authentication ≠ authorization** (authz is app-layer, enforced inside each wired contract); client identity/org never trusted.

**Active-org (SR3/R6):** server-resolved `Iv-Active-Organization` (server-validated, never client-trusted); `get_active_context`/`list_my_organizations`/`switch_active_organization` (`Doc-5C §C8`); switching = full context re-resolution + surface-set re-derivation. Seam: 7C owns the context/switcher mechanism, 7E owns management screens. Hybrid mounts Buyer+Vendor; Staff→Admin; Admin no active-org.

**Typed wired Doc-5 API-client (SR5) — server-side-only:** executes in the Next.js server layer (RSC reads / server-action writes); **browser never calls Doc-5, holds no credential, never sets the header**; binds only the **wired** subset (out-of-wire never callable); attaches server-validated header + a **stable idempotency key per submission**; consumes envelope (`Doc-5A §5.6`), error-by-class (`Doc-5A §6.2`), cursor pagination (`Doc-5A §8`, POLICY page_size). The single data-access seam.

**Notification center (SR6):** **defined here**, composes Doc-7B primitives; renders M6 `Doc-5H` reads; mutations = the verified wired commands **`mark_notification_read` / `archive_notification`** (`Doc-5H §5` BC-COMM-2); non-disclosure-bound (`CHK-7-040`); M6-owned; Realtime is transport (re-fetch).

**Segment conventions (SR7):** loading (suspense) · error (no protected enrichment) · streaming · not-found (≡ genuine absence) — reusing Doc-7B primitives.

**Out-of-frontend (SR8/R12):** no authoritative state; disposable client cache; **blobs via the M0/Doc-4B Storage mechanism by pointer** (contract carries `file_ref` only, never binary) — a client-facing upload-grant absent from the frozen wired surface is **`[ESC-7-API]`**, not coined; Realtime is transport.

**Conformance (SR9):** APPLIES `CHK-7-001/002/003/004/005/010/011/012/040/041/070/071/080/081`; **N/A** `CHK-7-020/021/030/031/042/050/051/060/061/062/063` (with reasons; `CHK-7-042` N/A per frozen SR9 — CC-1).

---

## Carried into Doc-7D…7H

`DR-7-SHELL` (the cross-cutting docs 7B + 7C are now both FROZEN; surfaces mount into them) · `DR-7-API` · `DR-7-STATE` · `[ESC-7-API]` (incl. the **file-upload grant path** — additive Doc-5x/Doc-4B patch, Board) · `[ESC-7-POLICY]` · `[ESC-7-DESIGN]`. Resolved only via named channels.

**Next deliverable:** **Doc-7D — Public Surface** — the first surface document (anonymous marketplace discovery, vendor microsites, public profiles, public browse, ads read), through the Board loop, gated by Doc-7A Appendix A (full set).

*End of Doc-7C SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7C realizes the App Shell & Data Layer over the frozen Doc-5 wired surface; server-side typed client; conforms to the frozen Doc-7A allocation; coins nothing.*
