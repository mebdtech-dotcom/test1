// Admin SHARED — native form-control chrome, consolidated from per-page copies (W2 maintainability
// refactor 1B; DRY-only, byte-identical output preserved). Admin pages style native <select>/<textarea>
// to match the kit Input for the controls the FROZEN kit does not ship. ADMIN-scoped by design: another
// surface's controls (the buyer's / vendor's) are surface-scoped, so an Admin page must not import them —
// this keeps the surfaces decoupled (the categories/new note). PRESENTATION-ONLY; single-purpose chrome.

/** Native <select> chrome for admin forms (matches the kit Input; the kit ships no Select primitive). */
export const ADMIN_SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-iv-ink-strong shadow-iv-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

/** Native <textarea> chrome for admin reason/notes fields (matches the kit Input; no kit Textarea yet). */
export const ADMIN_REASON_CLASS =
  "flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-iv-ink-strong shadow-iv-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";
