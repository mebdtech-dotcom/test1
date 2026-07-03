/**
 * Buyer dashboard data contracts.
 *
 * These are TYPE-ONLY definitions describing the shape of data the dashboard
 * shell renders. They contain no values, no domain enums, and no business
 * logic. Status/tone, labels, amounts, and recommendation flags are all
 * supplied by the caller (an adapter bound to the governed contracts) — the
 * UI never invents or derives them.
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

/** A single KPI slot. Value/trend are optional until the adapter provides them. */
export interface KpiMetric {
  id: string;
  label: string;
  /** Plain pre-formatted display value (mutually exclusive with `money`). */
  value?: string;
  /** Monetary value, rendered via iv-money. */
  money?: Money;
  /** Optional trend chip, fully formed by the caller. */
  trend?: StatusLabel;
}

export interface ApprovalItem {
  id: string;
  reference: string;
  title: string;
  requester: string;
  amount: Money;
  status: StatusLabel;
}

export interface RfqItem {
  id: string;
  reference: string;
  title: string;
  quoteCount: number;
  /** Caller-supplied closing label (e.g. relative time). */
  closesLabel: string;
  stage: StatusLabel;
}

export interface QuotationItem {
  id: string;
  supplier: string;
  reference: string;
  amount: Money;
  /** Caller-supplied rating label (no tier enum is defined here). */
  ratingLabel: string;
  /** Recommendation is decided upstream; the shell only displays the flag. */
  recommended: boolean;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  /** Caller-supplied label for the target chip (e.g. "RFQ", "Requisition"). */
  targetKind: string;
  /** Caller-supplied, pre-formatted timestamp label. */
  timeLabel: string;
  tone: StatusTone;
}

/** Aggregate payload the dashboard shell consumes. */
export interface BuyerDashboardData {
  kpis: KpiMetric[];
  approvals: ApprovalItem[];
  rfqs: RfqItem[];
  quotations: QuotationItem[];
  activity: ActivityItem[];
}

/** Current user, supplied upstream. `null` when unknown/unauthenticated. */
export interface SessionUser {
  name: string;
  role: string;
  initials: string;
}

/**
 * Chrome (sidebar/topbar) context that frames the dashboard. All fields are
 * caller-supplied; none are invented by the shell.
 */
export interface BuyerShellContext {
  user: SessionUser | null;
  /** Optional per-nav badge labels, keyed by nav id. Empty until wired. */
  navBadges: Record<string, string>;
  /** Optional notifications summary (e.g. "3 unread"); `null` shows none. */
  notificationsLabel: string | null;
}

/**
 * Adapter interface. Implementations bind these reads to the governed buyer
 * contracts/APIs. The shell depends only on this interface, never on a concrete
 * data source.
 */
export interface BuyerDashboardAdapter {
  getDashboardData(): Promise<BuyerDashboardData>;
  getShellContext(): Promise<BuyerShellContext>;
}
