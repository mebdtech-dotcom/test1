# Doc-7C — Content Pass-2 **Patch v1.0.1** (applies Pass-2 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7C_Content_v1.0_Pass2.md` (§5–§9 + Appendix) |
| Applies | `Doc-7C_Content_Pass2_Independent_Hard_Review_v1.0.md` (3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-2 **+ this patch** = clean §5–§9 + Appendix |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Freeze Audit → Doc-7C FROZEN |
| Discipline | Additive; nothing coined; no frozen document edited. Capability claims verified against the frozen surface |

---

## Changes

### C-1 — closes **MINOR-1** (CHK-7-042 scope)
§9.1 reclassified: `CHK-7-042` **APPLIES — scoped to the notification-center list + the client list mechanics**: the shell renders the contract's exclusion-applied result and **computes no client-side total/count**; cursor page boundaries reveal no excluded count/existence (`Doc-5A §8`/`Doc-4A §10.7`). Per-surface list non-disclosure for the surfaces' own views remains theirs.

### C-2 — closes **MINOR-2** (§8.2 file-upload grant — verified; ESC where unwired)
**Verified:** the frozen Doc-5 structures expose **no client-facing signed-URL / upload-grant contract**; file/Storage handling is an **M0 / Doc-4B mechanism consumed by pointer** (precedent: `Doc-5F` DF-8 "Platform Core — … storage, consumed … via Doc-4B mechanisms by pointer"). §8.2 amended:
> File blobs are handled via the **M0 / Doc-4B Storage mechanism**, consumed by pointer (the module that owns the document issues/holds the `file_ref`). The wired contract carries the **`file_ref` only, never the binary** (`Doc-2 §9`). **Where a client-facing upload-grant (e.g. signed-URL issuance) is required but not present in the frozen wired Doc-5 surface, flag `[ESC-7-API]`** (additive Doc-5x/Doc-4B patch, Board) — Doc-7C **does not assume or coin** a grant-issuing contract.

`[ESC-7-API]` (file-upload grant path) added to the carried-items register (§9.2).

### C-3 — closes **MINOR-3** (§6.2 notification mutations — verified, bound precisely)
**Verified:** M6 exposes the frozen wired commands **`mark_notification_read`** and **`archive_notification`** (`Doc-5H §5`, BC-COMM-2 — "User command … recipient-scoped … POST"). §6.2 amended to bind these exact names:
> Read-state / archive actions are **server actions to the frozen wired M6 commands `mark_notification_read` / `archive_notification`** (`Doc-5H §5` BC-COMM-2; recipient-scoped). Non-recipient reads collapse to `NOT_FOUND` (`Doc-5H R10`; `Doc-5A §6.3`). Read/archive state is a per-recipient inbox fact and **cannot influence prioritization/matching/trust** (`Doc-5H R6`). No mutation assumed beyond these.

### C-4 — closes **NITPICK-1** (Appendix names illustrative)
Appendix route-group names `(public)/(auth)/(app)/(admin)` labeled **illustrative**; the exact segment tree is fixed with the implementation (Doc-7C fixes topology **conventions**, not the file tree).

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MINOR-1 CHK-7-042 scope | MINOR | C-1: APPLIES scoped to notification list + client list mechanics | **CLOSED** |
| MINOR-2 signed-URL assumption | MINOR | C-2: Doc-4B storage mechanism by pointer; `[ESC-7-API]` where unwired; verified no grant contract in frozen surface | **CLOSED** — no capability assumed/coined |
| MINOR-3 mark-read assumption | MINOR | C-3: bound to verified `mark_notification_read`/`archive_notification` (Doc-5H §5 BC-COMM-2) | **CLOSED** — commands verified real; precise binding |
| NITPICK-1 Appendix names | NIT | C-4: illustrative | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** Both assumed-capability findings resolved by **verification against the frozen surface** (mark-read commands exist → bound; signed-URL grant absent → `[ESC-7-API]`, not coined). §9.1 applicability remains exact vs SR9 (with `CHK-7-042` now APPLIES-scoped — a tightening, consistent with the structure's `CHK-7-040` precedent).

**Doc-7C content (§0–§9 + Appendix) is now complete across Pass-1/2, both loops PASS.** Next: **Content Freeze Audit** → consolidate Doc-7C FROZEN.

*End of Content Pass-2 Patch v1.0.1 + Short Closure Check. Effective §5–§9 + Appendix = Pass-2 + this patch. Additive; nothing coined; capability claims verified.*
