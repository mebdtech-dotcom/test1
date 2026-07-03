import type {
  BuyerDashboardAdapter,
  BuyerDashboardData,
  BuyerShellContext,
  KpiMetric,
} from "./contracts";

/**
 * Mock buyer dashboard adapter.
 *
 * This returns an EMPTY, value-free payload so the dashboard renders as a
 * reusable shell with its governed empty states. It invents no amounts,
 * statuses, tiers, recommendations, approvals, or activity. Swap this for a
 * real adapter that reads the governed buyer contracts.
 */

/**
 * Placeholder KPI slots: these declare WHICH metrics the dashboard surfaces.
 * They carry labels only — no values and no trends — until wired to the API.
 */
const KPI_SLOTS: KpiMetric[] = [
  { id: "active-rfqs", label: "Active RFQs" },
  { id: "pending-quotations", label: "Pending quotations" },
  { id: "awaiting-approval", label: "Awaiting your approval" },
  { id: "spend-mtd", label: "Spend (month to date)" },
];

export const mockBuyerDashboardAdapter: BuyerDashboardAdapter = {
  async getDashboardData(): Promise<BuyerDashboardData> {
    // TODO(api): bind each field to the governed buyer contracts.
    //   kpis        -> GET buyer metrics summary (fills value/money + trend per slot)
    //   approvals   -> GET pending approvals      (cursor-paginated)
    //   rfqs        -> GET active RFQs            (cursor-paginated)
    //   quotations  -> GET recent quotations      (cursor-paginated)
    //   activity    -> GET supplier activity feed (cursor-paginated)
    return {
      kpis: KPI_SLOTS,
      approvals: [],
      rfqs: [],
      quotations: [],
      activity: [],
    };
  },

  async getShellContext(): Promise<BuyerShellContext> {
    // TODO(api): bind to the governed session/notification contracts.
    //   user               -> current session user
    //   navBadges          -> per-section unread/pending counts (keyed by nav id)
    //   notificationsLabel -> notifications summary (e.g. "3 unread")
    // The values below are illustrative placeholders so the shell renders with
    // representative chrome; swap for the real adapter to source live counts.
    return {
      user: { name: "Musa", role: "Procurement Manager", initials: "MB" },
      navBadges: { messages: "3", notifications: "8" },
      notificationsLabel: "8 unread",
    };
  },
};
