# Doc-7C — Content Pass-2 (§5–§9 + Appendix) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7C_Content_v1.0_Pass2.md` (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · realize-never-redecide (no assumed contract capability) |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- §5 server-side client (browser never calls Doc-5/holds creds/sets header) — carries structure MAJOR-1 fix (SR5); wired-only (`Doc-7A §3.7`; `Doc-5C §C3`, `Doc-5I §10` out-of-wire). CORRECT.
- §5.3 envelope (`Doc-5A §5.6`), cursor pagination (`Doc-5A §8`, opaque cursor, POLICY page_size), reference_id (`Doc-4A §22.1 C-05`); §5.5 error body + branch-on-class (`Doc-5A §6.2`/`Doc-4A §12.3`). CORRECT.
- §6 notification center defined here, composes Doc-7B primitives, M6-owned, non-disclosure-bound — conforms to frozen `Doc-7A` allocation + `Doc-7B BR5`. CORRECT.
- **§9.1 applicability table matches the frozen structure SR9 exactly** (APPLIES/N/A sets identical). CORRECT.

0 BLOCKER, 0 MAJOR. Two **assumed-capability** risks (realize-never-redecide) + one conformance-scoping refinement + one nit.

### MINOR-1 — `CHK-7-042` should APPLY scoped to the notification-center list, not be fully N/A
§9.1 marks `CHK-7-042` (list exclusion-set consistency) N/A, but §6 renders a **paginated notification list** through the §5.3 client. The same logic that moved `CHK-7-040` to APPLIES (scoped to the notification center) applies here: the shell's list mechanics must **inherit the contract's exclusion set and never compute a client-side total/count** that could leak via a page boundary (`Doc-5A §8`/`Doc-4A §10.7`).
**Required fix:** reclassify `CHK-7-042` to **APPLIES — scoped to the notification-center list + the client list mechanics** (no client-side total/count; renders the contract's exclusion-applied result). Per-surface list non-disclosure for the surfaces' own views remains theirs.

### MINOR-2 — §8.2 assumes a wired contract "issues a signed-URL grant" without tracing to a frozen Doc-5 contract
§8.2 states blobs transfer to Storage "via a signed-URL or equivalent grant **the wired contract issues**." Whether a frozen Doc-5 contract actually issues signed-URL/upload grants is **not established** — asserting it risks **coining a capability** (realize-never-redecide).
**Required fix:** §8.2 bind the upload-grant path to the **owning module's frozen file-ref contract** for that document type; where the frozen Doc-5 surface does not specify a grant-issuing contract, **flag `[ESC-7-API]`** (additive Doc-5x patch, Board) — do not assume. The invariant that stays: the contract carries the **`file_ref` only, never the binary** (`Doc-2 §9`).

### MINOR-3 — §6.2 assumes wired M6 "mark-read / dismiss" commands exist
§6.2 says marking-read/dismiss are "server actions to the wired M6 commands." M6 (`Doc-5H`) is characterized as **delivery-only / append-only** (roadmap) — a "dismiss" mutation may or may not be a frozen wired command. Asserting it risks coining a capability.
**Required fix:** §6.2 bind mark-read/dismiss to the **actual frozen `Doc-5H` wired commands** if they exist; if `Doc-5H` exposes no such mutation (append-only delivery), **flag `[ESC-7-API]`** or render read-state from the wired read only — do not assume a mutation. Verify against `Doc-5H` at content-freeze.

### NITPICK-1 — Appendix route-group names read as fixed
The Appendix names route groups `(public)/(auth)/(app)/(admin)`; this is illustrative Next.js route-group syntax, but could read as a frozen exact tree.
**Required fix:** label the route-group names **illustrative**; the exact segment tree is fixed with the implementation (Doc-7C fixes topology **conventions**, not the file tree).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 CHK-7-042 scoped to notification list | MINOR | Content Patch — reclassify |
| MINOR-2 §8.2 signed-URL grant trace-or-ESC | MINOR | Content Patch — bind or `[ESC-7-API]` |
| MINOR-3 §6.2 mark-read/dismiss trace-or-ESC | MINOR | Content Patch — bind to Doc-5H or `[ESC-7-API]` |
| NITPICK-1 Appendix route-group names | NIT | Content Patch — label illustrative |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7C FROZEN.

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — data layer sound; two genuine assumed-capability defects (signed-URL grant, mark-read command) caught under realize-never-redecide + a conformance-scoping fix.*
