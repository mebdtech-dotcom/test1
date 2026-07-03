// Documents shared home — COLUMN-MODEL SPEC (FE-DOC, WP fe-doc-01 · owner Round-2 NIT-01/02/04 +
// the strategic abstraction ruling). The single place the documents listing behavior is pinned so
// FE-DOC-01/02/03 render identically and a later `DocumentTable` (over the FE-SH-01-promoted base,
// Board packet item 3) swaps in mechanically. CONSTANTS ONLY — no component here; while FE-SH-01
// is unruled, each hub applies this spec to its own surface's listing table (buyer `DataListTable`
// today; never a new table copy — packet-documented fallback).

/** Default sort for every documents listing: newest first over the frozen `issued_at` (NIT-01). */
export const DOCUMENTS_DEFAULT_SORT = { field: "issued_at", direction: "desc" } as const;

/** Cursor pagination page size (NIT-02) — kit `PaginationControl`, the P-BUY-19 convention. */
export const DOCUMENTS_PAGE_SIZE = 25;

/** Search-refine debounce (owner NIT-R3-02 interaction spec — a component constant, NOT a perf budget; Doc-8 owns budgets). */
export const DOCUMENTS_SEARCH_DEBOUNCE_MS = 250;

/**
 * Responsive column priority (NIT-04), stated once: at narrow widths (≤ the `sm` breakpoint,
 * covering the 390px audit width) the listings fold `version`, `amount`, `counterparty` — plus the
 * secondary `issued_at`/`source` cells for scannability — behind `hideOnMobile`, and ALWAYS keep
 * `ref`, `kind`, `status`/`direction`, `file`.
 */
export const DOCUMENTS_MOBILE_HIDDEN_COLUMNS = [
  "version",
  "amount",
  "counterparty",
  "issued_at",
  "source",
] as const;
export const DOCUMENTS_ALWAYS_VISIBLE_COLUMNS = ["ref", "kind", "status", "file"] as const;
