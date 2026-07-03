/**
 * Vendor dashboard data contracts.
 *
 * These are TYPE-ONLY definitions describing the shape of data the vendor
 * shell renders. They contain no values, no domain enums, and no business
 * logic. Status/tone, labels, amounts, and completion flags are all supplied
 * by the caller (an adapter bound to the governed contracts) — the UI never
 * invents or derives them.
 *
 * Mirrors the buyer area contracts so both role areas share the same design
 * system and shell vocabulary.
 */

/** Presentation tone for a status chip. The meaning is decided upstream. */
export type StatusTone =
  "neutral" | "primary" | "success" | "warning" | "info" | "amber" | "destructive";

/** Money is rendered exactly as supplied (default currency BDT upstream). */
export interface Money {
  amount: string;
  currency: string;
}

/** A caller-supplied label + its presentation tone. No enum is implied. */
export interface StatusLabel {
  label: string;
  tone: StatusTone;
}

/** Current user, supplied upstream. `null` when unknown/unauthenticated. */
export interface SessionUser {
  name: string;
  role: string;
  initials: string;
}

/**
 * Chrome (sidebar/topbar) context that frames the vendor dashboard. All fields
 * are caller-supplied; none are invented by the shell.
 */
export interface VendorShellContext {
  user: SessionUser | null;
  /** Optional per-nav badge labels, keyed by nav id. Empty until wired. */
  navBadges: Record<string, string>;
  /** Optional notifications summary (e.g. "3 unread"); `null` shows none. */
  notificationsLabel: string | null;
}

/**
 * Adapter interface. Implementations bind these reads to the governed vendor
 * contracts/APIs. The shell depends only on this interface, never on a concrete
 * data source. Dashboard data reads are added incrementally as features land.
 */
export interface VendorDashboardAdapter {
  getShellContext(): Promise<VendorShellContext>;
}
