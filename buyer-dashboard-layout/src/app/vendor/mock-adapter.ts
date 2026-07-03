import type { VendorDashboardAdapter, VendorShellContext } from "./contracts";

/**
 * Mock vendor dashboard adapter.
 *
 * This returns a value-free shell context so the dashboard renders as a
 * reusable shell with its governed empty states. It invents no metrics,
 * statuses, or domain values. Swap this for a real adapter that reads the
 * governed vendor contracts.
 */
export const mockVendorDashboardAdapter: VendorDashboardAdapter = {
  async getShellContext(): Promise<VendorShellContext> {
    // TODO(api): bind to the governed session/notification contracts.
    //   user               -> current session user
    //   navBadges          -> per-section unread/pending counts (keyed by nav id)
    //   notificationsLabel -> notifications summary (e.g. "3 unread")
    // The values below are illustrative placeholders so the shell renders with
    // representative chrome; swap for the real adapter to source live counts.
    return {
      user: { name: "Rahim", role: "Vendor Admin", initials: "RA" },
      navBadges: { "buyer-inquiries": "4", notifications: "6" },
      notificationsLabel: "6 unread",
    };
  },
};
