// Curated STATIC presentation seed for the Public marketplace-discovery surface (Doc-7D · landing_page
// _spec §4–§6). This is editorial marketing content, NOT data and NOT a coined taxonomy: it stands in
// for the wired anonymous Public reads (`search_catalog` · `list_vendor_directory`) under the registered
// interims [ESC-7-API-CATNAV] / [ESC-7-API-PRODDETAIL]. One source of truth so the homepage and the
// /marketplace · /vendors · /categories routes stay consistent. No counts/totals are fabricated (GI-03);
// the "Industry" groupings are a NAVIGATION reference only — industries are not modeled in the frozen
// corpus (landing_page_spec §4 note), so this coins nothing.
import {
  Gauge,
  Cog,
  Settings2,
  Layers,
  Hammer,
  Bolt,
  Zap,
  CircuitBoard,
  Cable,
  FlaskConical,
  Droplets,
  Container,
  HardHat,
  Forklift,
  Wrench,
} from "lucide-react";
import type { VendorCardVM } from "@/frontend/components/vendor-card";
import type { ProductCardVM } from "@/frontend/components/product-card";
import type { CategoryVM } from "@/frontend/components/category-tile";
import type { CapabilityFlags } from "@/frontend/components/capability-matrix";
import type { FilterFacetGroup } from "@/frontend/components/filter-sidebar";

// ── Vendors (vendor directory seed). One is intentionally unverified → demonstrates that an absent
//    "Verified" badge is ABSENCE, never a fabricated "pending" state. ────────────────────────────────
export const VENDORS: VendorCardVM[] = [
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

/** Curated "featured" subset for showcases — editorial selection, never a computed score sort (GI-04). */
export const FEATURED_VENDORS: VendorCardVM[] = VENDORS.slice(0, 4);

// ── Products (catalog seed). Items without a price render "On request" — never a fabricated number. ──
export const PRODUCTS: ProductCardVM[] = [
  {
    id: "p-gate-valve-dn100",
    name: "Cast Steel Gate Valve DN100 PN16",
    vendorName: "Padma Valve & Fittings Ltd.",
    vendorSlug: "padma-valve-fittings",
    category: "Valves & Fittings",
    spec: "DN100 · PN16 · CS body · flanged",
    price: { amount: 14500, currency: "BDT" },
  },
  {
    id: "p-ms-plate-10mm",
    name: "MS Plate 10mm (ASTM A36)",
    vendorName: "Bengal Steel Industries",
    vendorSlug: "bengal-steel-industries",
    category: "Steel & Metals",
    spec: "10mm · 1500×6000 · hot-rolled",
  },
  {
    id: "p-vfd-22kw",
    name: "VFD Drive 22kW 3-Phase",
    vendorName: "Jamuna Electrical & Drives",
    vendorSlug: "jamuna-electrical-drives",
    category: "Electrical & Drives",
    spec: "22kW · 380–415V · IP20",
    price: { amount: 78000, currency: "BDT" },
  },
  {
    id: "p-centrifugal-pump-15hp",
    name: "End-Suction Centrifugal Pump 15HP",
    vendorName: "Meghna Pumps & Motors",
    vendorSlug: "meghna-pumps-motors",
    category: "Pumps & Motors",
    spec: "15HP · cast-iron · 50m head",
    price: { amount: 96000, currency: "BDT" },
  },
  {
    id: "p-safety-helmet",
    name: "Industrial Safety Helmet (HDPE)",
    vendorName: "Surma Safety Solutions",
    vendorSlug: "surma-safety-solutions",
    category: "Safety & PPE",
    spec: "HDPE shell · ratchet · EN 397",
    price: { amount: 450, currency: "BDT" },
  },
  {
    id: "p-butterfly-valve-dn150",
    name: "Wafer Butterfly Valve DN150",
    vendorName: "Padma Valve & Fittings Ltd.",
    vendorSlug: "padma-valve-fittings",
    category: "Valves & Fittings",
    spec: "DN150 · EPDM seat · lever",
    price: { amount: 8200, currency: "BDT" },
  },
  {
    id: "p-deep-groove-bearing",
    name: "Deep-Groove Ball Bearing 6309",
    vendorName: "Shitalakshya Engineering",
    vendorSlug: "shitalakshya-engineering",
    category: "Bearings & Power Transmission",
    spec: "6309-2RS · 45×100×25mm",
    price: { amount: 1250, currency: "BDT" },
  },
  {
    id: "p-industrial-lubricant",
    name: "Industrial Gear Oil ISO VG 220",
    vendorName: "Karnaphuli Chemicals Ltd.",
    vendorSlug: "karnaphuli-chemicals",
    category: "Lubricants",
    spec: "ISO VG 220 · 20L · mineral",
  },
];

/** Featured products subset for the homepage / marketplace showcase. */
export const FEATURED_PRODUCTS: ProductCardVM[] = PRODUCTS.slice(0, 6);

/**
 * Curated "Popular searches" terms — the ONE shared source (FE-PUB-09 promoted this from the
 * Command Center so the landing page and the mega menu can never diverge). Editorial
 * presentation choice, NOT a computed/"trending" signal (landing_page_spec §2.3(f)); every term
 * is independently verified to substring-match a real PRODUCTS entry (RV-0121 — no dead-end
 * chips), preserving the cross-category spread (valves / steel / electrical / pumps / safety).
 */
export const POPULAR_SEARCHES = [
  "gate valve",
  "MS plate",
  "VFD drive",
  "centrifugal pump",
  "safety helmet",
] as const;

// ── Categories (featured tiles + an industry-grouped navigation tree). [ESC-7-API-CATNAV] interim:
//    curated/static; counts omitted (no facet-aggregate read; never client-computed). ────────────────
export const FEATURED_CATEGORIES: CategoryVM[] = [
  { slug: "valves-fittings", name: "Valves & Fittings", icon: Gauge },
  { slug: "steel-metals", name: "Steel & Metals", icon: Layers },
  { slug: "electrical-drives", name: "Electrical & Drives", icon: Zap },
  { slug: "pumps-motors", name: "Pumps & Motors", icon: Cog },
  { slug: "safety-ppe", name: "Safety & PPE", icon: HardHat },
  { slug: "chemicals", name: "Chemicals", icon: FlaskConical },
];

/** An industry → categories grouping for the /categories navigation tree. NAVIGATION reference only —
 *  industries are not a modeled corpus taxonomy (coins nothing). */
export interface CategoryGroup {
  /** Wayfinding label (industry); not a coined taxonomy node. */
  industry: string;
  categories: CategoryVM[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    industry: "Mechanical & Fluid",
    categories: [
      { slug: "valves-fittings", name: "Valves & Fittings", icon: Gauge },
      { slug: "pumps-motors", name: "Pumps & Motors", icon: Cog },
      { slug: "bearings-transmission", name: "Bearings & Power Transmission", icon: Settings2 },
    ],
  },
  {
    industry: "Metals & Fabrication",
    categories: [
      { slug: "steel-metals", name: "Steel & Metals", icon: Layers },
      { slug: "fabrication-machining", name: "Fabrication & Machining", icon: Hammer },
      { slug: "fasteners", name: "Fasteners", icon: Bolt },
    ],
  },
  {
    industry: "Electrical & Automation",
    categories: [
      { slug: "electrical-drives", name: "Electrical & Drives", icon: Zap },
      { slug: "instrumentation", name: "Instrumentation", icon: CircuitBoard },
      { slug: "automation-control", name: "Automation & Control", icon: Cable },
    ],
  },
  {
    industry: "Process & Materials",
    categories: [
      { slug: "chemicals", name: "Chemicals", icon: FlaskConical },
      { slug: "lubricants", name: "Lubricants", icon: Droplets },
      { slug: "industrial-gases", name: "Industrial Gases", icon: Container },
    ],
  },
  {
    industry: "Safety & Facility",
    categories: [
      { slug: "safety-ppe", name: "Safety & PPE", icon: HardHat },
      { slug: "material-handling", name: "Material Handling", icon: Forklift },
      { slug: "tools", name: "Tools", icon: Wrench },
    ],
  },
];

/** Capability-filter facet labels (presentation-only — drives the filter sidebar's static checkboxes). */
export const CAPABILITY_FACETS = [
  { key: "can_supply", label: "Supply" },
  { key: "can_service", label: "Service" },
  { key: "can_fabricate", label: "Fabricate" },
  { key: "can_consult", label: "Consult" },
] as const;

/** Facet groups for the data-driven FilterSidebar (presentation — interim curated; no facet read yet). */
export const VENDOR_FACETS: FilterFacetGroup[] = [
  { heading: "Category", options: FEATURED_CATEGORIES.map((c) => ({ label: c.name })) },
  { heading: "Capability", options: CAPABILITY_FACETS.map((f) => ({ label: f.label })) },
  { heading: "Verification", options: [{ label: "Verified only" }] },
];

// ── Public vendor profile (P-PUB-13 · Doc-7D §4). Presentation VM for the anonymous microsite — the
//    PUBLIC projection of `get_public_vendor_profile`: identity + category + location + capability + the
//    binary verification signal + published "about" content + public ACTIVE categories. NO trust/perf
//    score or band, NO financial tier, NO capacity/turnover (deferred — [ESC-7G-SCORE-DISPLAY] pending +
//    not in the public read); NO claim/verification detail, governance bands, or draft content (Doc-5G R10).
export interface PublicVendorProfileVM {
  slug: string;
  name: string;
  /** Primary category label. */
  category: string;
  location?: string;
  /** Binary verification (M5 public projection). true → "Verified"; absence = no badge (never "pending"). */
  verified?: boolean;
  /** Four-flag capability matrix (Invariant #1). */
  capability?: Partial<CapabilityFlags>;
  /** Published microsite description (editorial seed — maps to the published M2 content when wired). */
  about?: string;
  /** Public ACTIVE category names (no status/level — those are vendor-internal). */
  categories?: string[];
}

/** Editorial extras per vendor (curated presentation seed — stands in for published M2 microsite content). */
const PROFILE_EXTRAS: Record<string, { about: string; categories: string[] }> = {
  "padma-valve-fittings": {
    about:
      "Padma Valve & Fittings supplies and fabricates industrial valves and pipeline fittings for power, water-treatment, and process plants across Bangladesh. ISO-9001 quality systems with in-house machining and testing.",
    categories: ["Valves & Fittings", "Pumps & Motors", "Safety & PPE"],
  },
  "bengal-steel-industries": {
    about:
      "Bengal Steel Industries is a Chattogram-based supplier of MS plate, structural sections, and custom fabrication for shipbuilding, construction, and heavy-engineering projects.",
    categories: ["Steel & Metals", "Fabrication & Machining"],
  },
  "jamuna-electrical-drives": {
    about:
      "Jamuna Electrical & Drives supplies and services VFDs, motors, switchgear, and control panels, with engineering support for industrial automation across the Dhaka belt.",
    categories: ["Electrical & Drives", "Automation & Control"],
  },
  "meghna-pumps-motors": {
    about:
      "Meghna Pumps & Motors supplies and services centrifugal and submersible pumps, motors, and spares for water, effluent, and process applications.",
    categories: ["Pumps & Motors"],
  },
  "surma-safety-solutions": {
    about:
      "Surma Safety Solutions supplies certified industrial PPE and safety equipment, with advisory support on plant safety compliance.",
    categories: ["Safety & PPE"],
  },
  "karnaphuli-chemicals": {
    about:
      "Karnaphuli Chemicals supplies industrial and process chemicals, lubricants, and gases, with technical advisory for treatment and maintenance programmes.",
    categories: ["Chemicals", "Lubricants"],
  },
  "titas-fabrication-works": {
    about:
      "Titas Fabrication Works provides custom fabrication, machining, and on-site servicing for structural and mechanical assemblies.",
    categories: ["Fabrication & Machining"],
  },
  "shitalakshya-engineering": {
    about:
      "Shitalakshya Engineering supplies and services bearings, power-transmission components, and rotating equipment, with consulting on reliability and maintenance.",
    categories: ["Bearings & Power Transmission", "Pumps & Motors"],
  },
};

/** Look up the public profile for a vendor slug — `undefined` → the page renders a byte-equivalent 404. */
export function getPublicVendorProfile(slug: string): PublicVendorProfileVM | undefined {
  const vendor = VENDORS.find((v) => v.slug === slug);
  if (!vendor) return undefined;
  const extra = PROFILE_EXTRAS[slug];
  return {
    slug: vendor.slug,
    name: vendor.name,
    category: vendor.category,
    location: vendor.location,
    verified: vendor.verified,
    capability: vendor.capability,
    about: extra?.about,
    categories: extra?.categories ?? [vendor.category],
  };
}

/** Vendor-scoped PUBLISHED catalog — the public projection boundary (the seed carries only public products). */
export function getPublicVendorProducts(slug: string): ProductCardVM[] {
  return PRODUCTS.filter((p) => p.vendorSlug === slug);
}
