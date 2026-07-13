// P-BUY-02 Buyer Discover vendors route (Doc-7F · `T-LISTING`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): binds the M2 public reads `marketplace.list_vendor_directory.v1` /
// `marketplace.search_catalog.v1` (Doc-4D §B), NOT wired today (PARKED — Wave 4). A realistic mock stands
// in for the public projection {name, capability_flags, geography, categories, verified}. Only published/
// non-excluded rows appear; NO buyer-private (blacklist/CRM) fact exists here (Inv #11 / §7.5). Results are
// the catalog set in contract order — discovery ≠ matching (no ranking/scoring/recommend; DD-2).

import { DiscoverView } from "./discover-view";
import type { DiscoverData } from "../_components/discover-view-models";
import type { VendorCardVM } from "@/frontend/components/vendor-card";

export const metadata = {
  title: "Discover vendors",
};

// Realistic industrial-procurement MOCK — the public projection mapped to the shared VendorCard VM
// (capability = 4-flag matrix; trust = binary `verified` only, no score). In contract order (not re-ranked).
//
// Vendor identities are kept IDENTICAL to the public discovery seed
// (`app/(public)/_components/discovery/seed.ts` `VENDORS`) rather than a second, divergent fictional
// catalog: cards here link out to the public microsite (`/vendors/[slug]`, FE-BUY-10 2026-07-03 —
// owner-ruled reuse, no in-app P-BUY-04 route), and both surfaces already declare they bind the SAME
// M2 public reads (`list_vendor_directory` / `search_catalog`) once Wave-4 wires them — so aligned mock
// content previews the real behavior instead of inventing a second catalog that would 404 on click.
const MOCK_VENDORS: VendorCardVM[] = [
  {
    slug: "padma-valve-fittings",
    name: "Padma Valve & Fittings Ltd.",
    category: "Valves & Fittings",
    location: "Dhaka · Tejgaon I/A",
    verified: true,
    capability: { can_supply: true, can_service: true, can_fabricate: true, can_consult: false },
  },
  {
    slug: "bengal-steel-industries",
    name: "Bengal Steel Industries",
    category: "Steel & Metals",
    location: "Chattogram · Kalurghat",
    verified: true,
    capability: { can_supply: true, can_service: false, can_fabricate: true, can_consult: false },
  },
  {
    slug: "jamuna-electrical-drives",
    name: "Jamuna Electrical & Drives",
    category: "Electrical & Drives",
    location: "Dhaka · Tongi",
    // Intentionally unverified — renders as absence (no "Verified" badge), not a fabricated state.
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: true },
  },
  {
    slug: "meghna-pumps-motors",
    name: "Meghna Pumps & Motors",
    category: "Pumps & Motors",
    location: "Narayanganj · Fatullah",
    verified: true,
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: false },
  },
  {
    slug: "surma-safety-solutions",
    name: "Surma Safety Solutions",
    category: "Safety & PPE",
    location: "Sylhet · Khadimnagar",
    verified: true,
    capability: { can_supply: true, can_service: false, can_fabricate: false, can_consult: true },
  },
  {
    slug: "karnaphuli-chemicals",
    name: "Karnaphuli Chemicals Ltd.",
    category: "Chemicals",
    location: "Chattogram · Sitakunda",
    verified: true,
    capability: { can_supply: true, can_service: false, can_fabricate: false, can_consult: true },
  },
  {
    slug: "titas-fabrication-works",
    name: "Titas Fabrication Works",
    category: "Fabrication & Machining",
    location: "Gazipur · Tongi",
    verified: true,
    capability: { can_supply: false, can_service: true, can_fabricate: true, can_consult: false },
  },
  {
    slug: "shitalakshya-engineering",
    name: "Shitalakshya Engineering",
    category: "Bearings & Power Transmission",
    location: "Narayanganj · Siddhirganj",
    verified: true,
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: true },
  },
];

export default async function BuyerDiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  // The query is echoed for presentation; the real search + filters bind server-side (PARKED).
  const data: DiscoverData = { items: MOCK_VENDORS, query: sp.q };
  return <DiscoverView data={data} />;
}
