import type { NextConfig } from "next";

// Wave 0 bootstrap — single Next.js deployable (modular monolith).
// No business config; module/feature config lands with its owning wave.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Cluster #1 merge (Team-1 build order F1 · closure record §2.4). The standalone Leadboard
  // (`/sell/leads`) folded into the RFQ workspace as the Pipeline lens; its index retires as a nav
  // destination. This is a PERMANENT (308) redirect to the merged board view.
  //
  // EXACT-PATH SOURCE ONLY: `source: "/sell/leads"` matches that one path — it does NOT match
  // `/sell/leads/[leadId]` (Next.js path matching requires an explicit `/:param`/`/:path*` segment to
  // recurse). The per-lead detail route is KEPT (F3), so it must stay reachable; this redirect leaves
  // it untouched.
  async redirects() {
    return [
      {
        source: "/sell/leads",
        destination: "/sell/rfqs?view=board",
        permanent: true,
      },
      // Amendment A1 (closure record v1.1 §7): the Buyer CRM surface is renamed at both
      // presentation and route levels — `/sell/buyer-crm` is a redirect SOURCE ONLY (it must not
      // render, host nested detail routes, or become an alternate canonical URL; its route file is
      // deleted). Exact-path source; incoming query strings are auto-forwarded by Next.js since the
      // destination declares none (A1's query-preservation requirement).
      {
        source: "/sell/buyer-crm",
        destination: "/sell/buyer-relationships",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
