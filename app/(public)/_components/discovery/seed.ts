// Curated STATIC presentation seed for the Public marketplace-discovery surface (Doc-7D · landing_page
// _spec §4–§6). This is editorial marketing content, NOT data and NOT a coined taxonomy: it stands in
// for the wired anonymous Public reads (`search_catalog` · `list_vendor_directory` ·
// `marketplace.get_public_product_detail.v1`) under the registered interim [ESC-7-API-CATNAV]
// (`ESC-7-API-PRODDETAIL` resolved 2026-07-03, RV-0130 — FE-PUB-05 realizes its FE shape against
// this seed). One source of truth so the homepage and the /marketplace · /vendors · /categories
// routes stay consistent. No counts/totals are fabricated (GI-03); the "Industry" groupings are a
// NAVIGATION reference only — industries are not modeled in the frozen corpus (landing_page_spec
// §4 note), so this coins nothing.
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
// FE-PUB-05: the real, already-frozen-mirrored 794-node taxonomy tree (FE-PUB-09), reused for the
// Doc-5D breadcrumb deterministic pick rule — imported from the CONCRETE model files, never the
// `@/frontend/navigation` barrel (RV-0126's lesson: the barrel also re-exports every heavy
// `MegaMenu*` component; this seed module is imported by many routes and must never risk pulling
// that chunk into an always-eager path).
import { buildTaxonomyIndex } from "@/frontend/navigation/model/taxonomy-index";
import { OVERLAY_V1 } from "@/frontend/navigation/model/overlay.v1";
import type { CategoryNodeData, CategoryNodeVM } from "@/frontend/navigation/model/types";
import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";

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

// ── Products (catalog seed). Items without a price render "On request" — never a fabricated number.
//    `id` is UUID-shaped (FE-PUB-05, ADR-025 Decision 2 — opaque IDs; the id-anchored canonical URL
//    law requires a real resolution key, not the old slug-shaped placeholder). ─────────────────────
export const PRODUCTS: ProductCardVM[] = [
  {
    id: "a1b2c3d4-1111-4a11-8a11-000000000001",
    name: "Cast Steel Gate Valve DN100 PN16",
    vendorName: "Padma Valve & Fittings Ltd.",
    vendorSlug: "padma-valve-fittings",
    category: "Valves & Fittings",
    spec: "DN100 · PN16 · CS body · flanged",
    price: { amount: 14500, currency: "BDT" },
  },
  {
    id: "a1b2c3d4-2222-4a22-8a22-000000000002",
    name: "MS Plate 10mm (ASTM A36)",
    vendorName: "Bengal Steel Industries",
    vendorSlug: "bengal-steel-industries",
    category: "Steel & Metals",
    spec: "10mm · 1500×6000 · hot-rolled",
  },
  {
    id: "a1b2c3d4-3333-4a33-8a33-000000000003",
    name: "VFD Drive 22kW 3-Phase",
    vendorName: "Jamuna Electrical & Drives",
    vendorSlug: "jamuna-electrical-drives",
    category: "Electrical & Drives",
    spec: "22kW · 380–415V · IP20",
    price: { amount: 78000, currency: "BDT" },
  },
  {
    id: "a1b2c3d4-4444-4a44-8a44-000000000004",
    name: "End-Suction Centrifugal Pump 15HP",
    vendorName: "Meghna Pumps & Motors",
    vendorSlug: "meghna-pumps-motors",
    category: "Pumps & Motors",
    spec: "15HP · cast-iron · 50m head",
    price: { amount: 96000, currency: "BDT" },
  },
  {
    id: "a1b2c3d4-5555-4a55-8a55-000000000005",
    name: "Industrial Safety Helmet (HDPE)",
    vendorName: "Surma Safety Solutions",
    vendorSlug: "surma-safety-solutions",
    category: "Safety & PPE",
    spec: "HDPE shell · ratchet · EN 397",
    price: { amount: 450, currency: "BDT" },
  },
  {
    id: "a1b2c3d4-6666-4a66-8a66-000000000006",
    name: "Wafer Butterfly Valve DN150",
    vendorName: "Padma Valve & Fittings Ltd.",
    vendorSlug: "padma-valve-fittings",
    category: "Valves & Fittings",
    spec: "DN150 · EPDM seat · lever",
    price: { amount: 8200, currency: "BDT" },
  },
  {
    id: "a1b2c3d4-7777-4a77-8a77-000000000007",
    name: "Deep-Groove Ball Bearing 6309",
    vendorName: "Shitalakshya Engineering",
    vendorSlug: "shitalakshya-engineering",
    category: "Bearings & Power Transmission",
    spec: "6309-2RS · 45×100×25mm",
    price: { amount: 1250, currency: "BDT" },
  },
  {
    id: "a1b2c3d4-8888-4a88-8a88-000000000008",
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

// ── Public product detail (P-PUB-11 · FE-PUB-05, ADR-025 + Doc-4D v1.0.3 / Doc-5D v1.0.1). The
//    composed Product Detail Projection: product core + a breadcrumb resolved by the frozen
//    deterministic pick rule. NORMATIVE EXCLUSIONS carried from the folded contract: NO
//    trust/performance values on this record itself (a page composes the binary
//    `VendorVerifiedBadge` BESIDE it, never inside), NO price/currency, NO counts, NO related
//    items (carried separately to `ESC-7-API/related`), NO buyer-private/entitlement facts.
//    `vendor_slug` is resolved here for server-side href construction only — never rendered as
//    bare text (ADR-024/ADR-025 builder-only discipline). ──────────────────────────────────────

const TAXONOMY = buildTaxonomyIndex(taxonomySeed.nodes as CategoryNodeData[], OVERLAY_V1);

interface CategoryAssignmentSeed {
  /** A real node id from the frozen-mirrored 794-node taxonomy tree — never a coined category. */
  categoryId: string;
  isSpecialized: boolean;
  level: "primary" | "secondary";
}

/** Vendor-scoped category assignments (Doc-2 `category_assignments` shape — vendor-scoped, not a
 *  direct product→category reference; per the frozen rule, breadcrumbs derive from the OWNING
 *  VENDOR's assignments, applied uniformly across that vendor's products). Two vendors are
 *  deliberately given a multi-assignment pair so the deterministic pick rule genuinely exercises
 *  both tiebreak branches on real data (Padma: depth tiebreak; Karnaphuli: is_specialized tiebreak
 *  at equal depth) rather than only the single-path degenerate case. */
const VENDOR_CATEGORY_ASSIGNMENTS: Record<string, CategoryAssignmentSeed[]> = {
  "padma-valve-fittings": [
    { categoryId: "06064ac3-3704-50bd-96de-a6d73994d492", isSpecialized: false, level: "primary" }, // valves-piping (L2)
    { categoryId: "bdeff457-635e-540a-a809-4ff6782868ae", isSpecialized: true, level: "secondary" }, // butterfly-valves (L4) — deepest wins
  ],
  "bengal-steel-industries": [
    { categoryId: "82a60d22-5bb9-5c6d-978d-8c4a9173962b", isSpecialized: true, level: "primary" }, // ms-sections (L4)
  ],
  "jamuna-electrical-drives": [
    { categoryId: "f5b32a01-9cf5-5fc6-89e4-b0a771c994f5", isSpecialized: true, level: "primary" }, // variable-frequency-drives (L3)
  ],
  "meghna-pumps-motors": [
    { categoryId: "05055342-c074-50bc-9d53-5e9c00da586e", isSpecialized: true, level: "primary" }, // centrifugal-pumps (L4)
  ],
  "surma-safety-solutions": [
    { categoryId: "3fec6a5c-285e-50fb-a0a7-43f396233193", isSpecialized: false, level: "primary" }, // ppe (L2 — deepest available in the tree)
  ],
  "karnaphuli-chemicals": [
    {
      categoryId: "6f7ca38c-6208-5b96-a0b4-40ef3f4da831",
      isSpecialized: false,
      level: "secondary",
    }, // basic-chemicals (L3)
    { categoryId: "6e5d612a-27e3-5c1e-aa99-7fff611457b4", isSpecialized: true, level: "primary" }, // lubricants-oils (L3) — equal depth, is_specialized wins
  ],
  "shitalakshya-engineering": [
    { categoryId: "16d20ada-484b-5a8a-8fe5-0d8730b94b99", isSpecialized: true, level: "primary" }, // ball-bearings (L4)
  ],
};

export interface CategoryPathSegment {
  categoryId: string;
  slug: string;
  name: string;
}

/**
 * Doc-5D_PublicProductDetail_Patch_v1.0.1 Part 2 — the breadcrumb deterministic pick rule, run for
 * real over the vendor's active category assignments: (1) deepest path wins, (2) `is_specialized`
 * beats not, (3) `level = primary` beats `secondary`, (4) lowest category-UUID as the final,
 * always-total tiebreak. Order-independent — the same assignment set always yields the same
 * `primary_category_path` (and the same `category_paths[]` order), regardless of input order.
 */
function pickPrimaryCategoryPath(assignments: CategoryAssignmentSeed[]): {
  primary: CategoryPathSegment[];
  all: CategoryPathSegment[][];
} {
  const toSegments = (chain: CategoryNodeVM[]): CategoryPathSegment[] =>
    chain.map((n) => ({ categoryId: n.id, slug: n.slug, name: n.name }));

  const resolved = assignments
    .map((a) => ({ assignment: a, chain: TAXONOMY.pathTo(a.categoryId) }))
    // Defensive only — every seeded assignment above resolves; an unresolvable id is dropped, not
    // fabricated a home (mirrors the taxonomy index's own orphan-drop discipline).
    .filter((p) => p.chain.length > 0);

  const sorted = [...resolved].sort((a, b) => {
    if (b.chain.length !== a.chain.length) return b.chain.length - a.chain.length;
    if (a.assignment.isSpecialized !== b.assignment.isSpecialized) {
      return a.assignment.isSpecialized ? -1 : 1;
    }
    if (a.assignment.level !== b.assignment.level) {
      return a.assignment.level === "primary" ? -1 : 1;
    }
    return a.assignment.categoryId < b.assignment.categoryId ? -1 : 1;
  });

  return {
    primary: sorted.length > 0 ? toSegments(sorted[0].chain) : [],
    all: sorted.map((p) => toSegments(p.chain)),
  };
}

/** Editorial product descriptions (curated presentation seed — prose over the existing `spec`
 *  field; coins no new technical fact). Absence = no description section rendered (GI-03). */
const PRODUCT_DETAIL_EXTRAS: Record<string, { description: string }> = {
  "a1b2c3d4-1111-4a11-8a11-000000000001": {
    description:
      "Cast steel gate valve rated PN16, flanged ends, suitable for isolation duty in water, steam, and general industrial piping systems.",
  },
  "a1b2c3d4-2222-4a22-8a22-000000000002": {
    description:
      "Hot-rolled mild steel plate to ASTM A36, 1500×6000mm sheet size, for structural fabrication and general engineering use.",
  },
  "a1b2c3d4-3333-4a33-8a33-000000000003": {
    description:
      "Three-phase variable frequency drive rated 22kW, 380–415V supply, IP20 enclosure, for motor speed control in industrial process and utility applications.",
  },
  "a1b2c3d4-4444-4a44-8a44-000000000004": {
    description:
      "End-suction centrifugal pump with cast-iron casing, 15HP duty, rated for approximately 50m head — suited to water transfer and general process circulation.",
  },
  "a1b2c3d4-5555-4a55-8a55-000000000005": {
    description:
      "Industrial safety helmet with HDPE shell and ratchet headband adjustment, certified to EN 397 for impact and penetration protection.",
  },
  "a1b2c3d4-6666-4a66-8a66-000000000006": {
    description:
      "Wafer-style butterfly valve, DN150, EPDM seat, lever-operated — for on/off and throttling duty in general industrial piping.",
  },
  "a1b2c3d4-7777-4a77-8a77-000000000007": {
    description:
      "Sealed deep-groove ball bearing, size 6309-2RS (45×100×25mm), for general-purpose rotating machinery.",
  },
  "a1b2c3d4-8888-4a88-8a88-000000000008": {
    description:
      "Mineral-based industrial gear oil, ISO VG 220 viscosity grade, supplied in 20-litre containers — for enclosed gear and bearing lubrication.",
  },
};

export interface PublicProductDetailVM {
  id: string;
  name: string;
  /** Absence = no description section rendered (GI-03) — never a fabricated blurb. */
  description?: string;
  vendorName: string;
  vendorSlug: string;
  /** Binary verification signal only (M5 public projection) — absence = no badge, never "pending". */
  vendorVerified?: boolean;
  spec?: string;
  /** Selected by the deterministic pick rule above — empty iff the vendor has no resolvable assignment. */
  primaryCategoryPath: CategoryPathSegment[];
  /** Every resolved path, primary first, remaining ordered by the same comparison rule. */
  categoryPaths: CategoryPathSegment[][];
}

/** Look up the public Product Detail Projection for a product id — `undefined` → the page renders a
 *  byte-equivalent 404 (R9; unknown id and an orphaned vendor reference collapse identically).
 *  Deliberately carries NO related-items field — the folded contract's normative exclusion
 *  manifest excludes related items from this projection by name ("no related items — carried
 *  `ESC-7-API/related`"); that surface is a separate, not-yet-realized escalation, not this
 *  milestone's to build (Review-A MAJOR, corrected). */
export function getPublicProductDetail(id: string): PublicProductDetailVM | undefined {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return undefined;
  const vendor = VENDORS.find((v) => v.slug === product.vendorSlug);
  if (!vendor) return undefined;

  const assignments = VENDOR_CATEGORY_ASSIGNMENTS[product.vendorSlug] ?? [];
  const { primary, all } = pickPrimaryCategoryPath(assignments);

  return {
    id: product.id,
    name: product.name,
    description: PRODUCT_DETAIL_EXTRAS[product.id]?.description,
    vendorName: product.vendorName,
    vendorSlug: product.vendorSlug,
    vendorVerified: vendor.verified,
    spec: product.spec,
    primaryCategoryPath: primary,
    categoryPaths: all,
  };
}
