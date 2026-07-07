// Company-website editorial SEED for the public vendor microsite (M2.6). This is curated EDITORIAL
// presentation content — NOT data, NOT a coined taxonomy, NOT a frozen contract. It stands in for the
// vendor's published M2 microsite content exactly as the discovery `PROFILE_EXTRAS` seed does, under the
// same registered interim. The fields here (mission/vision/values/why/history/management/industries/
// certifications/stats/gallery/projects/downloads/faq/contact) have NO frozen public-projection columns;
// they coin nothing and are rendered as supplier-provided company-website content only.
//
// GOVERNANCE: presentation-only. NO trust/performance score, NO financial tier, NO turnover/revenue, NO
// platform-verification claim (certifications are SELF-DECLARED company info, never the binary "Verified"
// signal — that stays the M5 public projection). Industries are a presentation reference (not modeled in
// the frozen corpus — landing_page_spec §4 note). Stats are illustrative, supplier-provided, never
// computed. Projects stand in for the frozen `showcase_projects` entity (not wired) with sector/role
// "client" descriptors only — never a fabricated company name. Contact channels are platform-mediated
// (sign-in gated — the lead model). Every field is optional → the components render genuine-empty when
// absent.
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface CompanyValueVM {
  title: string;
  description?: string;
}
export interface CompanyDifferentiatorVM {
  title: string;
  description?: string;
}
export interface CompanyTimelineEntryVM {
  /** Optional label (e.g. a milestone phase) — the seed uses phase labels, never fabricated dates. */
  year?: string;
  title: string;
  description?: string;
}
export interface ManagementMessageVM {
  /** Role-based attribution (the seed never fabricates an individual's name). */
  name: string;
  title: string;
  message: string;
}
export interface CompanyStatVM {
  label: string;
  /** Display string only — never computed (e.g. "15+", "30,000 sq ft"). */
  value: string;
}
export interface CertificationVM {
  name: string;
  detail?: string;
}
export interface CapabilityAreaVM {
  name: string;
  description?: string;
}
export interface GalleryItemVM {
  label: string;
  caption?: string;
}
export interface ProjectShowcaseVM {
  name: string;
  industry?: string;
  /** Sector/role descriptor (list-card default) — the list cards show THIS, never a company name. */
  client?: string;
  scope?: string;
  /** Generic period label — never a fabricated exact date. */
  year?: string;
  /** Equipment/scope tags (editorial). */
  equipment?: string[];
  /** Decorative tile label (no fabricated image source). */
  imageLabel?: string;

  // ── FE-PUB-11 Project Detail page fields (all optional; the list card ignores them, so its render
  //    is byte-stable). Every field is vendor-authored editorial content (coins no platform signal,
  //    R7-safe). Governance rulings from the design companion §6.9 are honored HERE:
  /** URL segment for the detail page (`/vendors/[slug]/projects/[slug]`). Absent → "View details" stays disabled. */
  slug?: string;
  /**
   * Named client — shown on the DETAIL page only (owner Board ruling R2, companion §6.9). Vendor-authored
   * + consent-responsible; coins no platform signal; never exposes a buyer-private/blacklisted relationship
   * (a vendor publishing its own reference ≠ the platform disclosing a buyer's private sourcing record).
   * The list card deliberately keeps showing the sector/role `client` above (R2 scoped to the detail page).
   */
  namedClient?: string;
  /** Project status label — rendered as a StatusChip (frozen state vocabulary, e.g. "completed"). */
  status?: string;
  /** Duration label (e.g. "6 Months") — editorial, never a computed figure. */
  durationLabel?: string;
  /** Location label (e.g. "Chittagong, Bangladesh"). */
  location?: string;
  /** "The Challenge" narrative block (vendor-authored). */
  challenge?: string;
  /** "Our Solution" narrative block (vendor-authored). */
  solution?: string;
  /** Scope-of-deliverables checklist (vendor-authored editorial). */
  deliverables?: string[];
  /** Technologies & methods tags (editorial descriptors, not a coined governance signal). */
  technologies?: string[];
  /** Category tags for the sidebar (e.g. ["Power", "Infrastructure"]) — labels only, no facet read. */
  tags?: string[];
}

// ── Project Detail template sub-VMs (FE-PUB-11 · P-PUB-25). All optional, all vendor-authored editorial
//    (coin no platform signal). The Project Detail page composes these; the list card (ProjectShowcase)
//    keeps the narrower `ProjectShowcaseVM` and never sees them. Governance rulings honored HERE:
//      R1 binary Verified only · R2 named client detail-only · R3 disabled-honest documents, no platform
//      "verify" · R4 decorative placeholder media (no fabricated <img> source).
/** Presentation-only tile kind (drives the placeholder icon) — NOT a modeled asset type. */
export type ProjectMediaKind = "image" | "video" | "document";
export interface ProjectMediaItemVM {
  kind: ProjectMediaKind;
  /** Decorative tile label (no fabricated media source — R4). */
  label: string;
  /** Optional caption chip shown when this item is the active hero tile. */
  caption?: string;
}
export interface ProjectSpecRowVM {
  label: string;
  /** Display string only — never a computed figure (mirrors CompanyStatVM discipline). */
  value: string;
}
export interface ProjectDocumentVM {
  name: string;
  /** File-kind hint (e.g. "PDF"). No href, no size — nothing is fabricated (R3). */
  fileType?: string;
}
export interface ProjectDocumentGroupVM {
  /** Editorial group heading (e.g. "Certificates", "QA/QC Records") — a label, coins no taxonomy. */
  title: string;
  documents: ProjectDocumentVM[];
}
export interface ProjectTestimonialVM {
  message: string;
  /** Role-based attribution (the seed never fabricates an individual's name). */
  attribution: string;
  /** Optional organization — may name the client (R2 scope: detail page only). */
  organization?: string;
}
/** The Project Detail template view-model — extends the list-card VM with detail-only section data. */
export interface ProjectDetailVM extends ProjectShowcaseVM {
  /** Hero media gallery — decorative placeholder tiles only (R4). Supersedes the old hero/gallery labels. */
  media?: ProjectMediaItemVM[];
  /** "The Result" narrative block (joins challenge/solution). */
  result?: string;
  /** Project value — EDITORIAL display string (e.g. "BDT 12 Crore (approx.)"), never a computed amount. */
  valueLabel?: string;
  /** Technical specifications — label/value display rows. */
  specifications?: ProjectSpecRowVM[];
  /** Materials & equipment used — detail-page superset; the list card keeps its short `equipment` tags. */
  materialsEquipment?: string[];
  /** Compliance repository — grouped document NAMES only; rendered disabled-honest (R3). */
  documents?: ProjectDocumentGroupVM[];
  /** Project photo-gallery grid — reuses GalleryItemVM (decorative tiles, R4). */
  gallery?: GalleryItemVM[];
  /** Client testimonial (vendor-authored; org naming allowed here only — R2). */
  testimonial?: ProjectTestimonialVM;
}
export interface DownloadItemVM {
  label: string;
  /** File-kind hint (e.g. "PDF"). */
  fileType?: string;
  description?: string;
}
export interface FaqItemVM {
  question: string;
  answer: string;
}
export interface CompanyContactVM {
  /** Editorial location line (mirrors the discovery seed's editorial location). */
  address?: string;
  /** Business hours (editorial). */
  hours?: string;
  /** Decorative map-placeholder label (no real embed/coordinates). */
  mapLabel?: string;
}

export interface VendorCompanyContentVM {
  overview?: string;
  businessOverview?: string;
  facilities?: string;
  mission?: string;
  vision?: string;
  values?: CompanyValueVM[];
  whyChooseUs?: CompanyDifferentiatorVM[];
  history?: CompanyTimelineEntryVM[];
  management?: ManagementMessageVM;
  industries?: string[];
  capabilities?: CapabilityAreaVM[];
  certifications?: CertificationVM[];
  gallery?: GalleryItemVM[];
  stats?: CompanyStatVM[];
  projects?: ProjectDetailVM[];
  downloads?: DownloadItemVM[];
  faq?: FaqItemVM[];
  contact?: CompanyContactVM;
}

// ── Generic, shared editorial defaults (presentation reference; coin nothing). ──────────────────────
const DEFAULT_VALUES: CompanyValueVM[] = [
  { title: "Quality & reliability", description: "Built to specification, delivered on time." },
  { title: "Safety first", description: "Safe practices on every site and in every workshop." },
  { title: "Integrity", description: "Honest commitments and transparent dealings." },
  {
    title: "Customer partnership",
    description: "Long-term relationships over one-off transactions.",
  },
  {
    title: "Continuous improvement",
    description: "Investing in people, process, and equipment.",
  },
];

const DEFAULT_WHY_CHOOSE_US: CompanyDifferentiatorVM[] = [
  {
    title: "Engineering-led",
    description: "Specifications matched to your process — not just a parts list.",
  },
  {
    title: "On-time delivery",
    description: "Planned lead times with proactive updates through to handover.",
  },
  {
    title: "Quality assurance",
    description: "ISO-aligned processes with in-house inspection and testing.",
  },
  {
    title: "After-sales support",
    description: "Spares, service, and technical support beyond the sale.",
  },
  {
    title: "Sourcing strength",
    description: "In-house capability backed by a vetted supplier network.",
  },
  {
    title: "Responsive service",
    description: "A dedicated point of contact for every order.",
  },
];

const DEFAULT_HISTORY: CompanyTimelineEntryVM[] = [
  { title: "Founded", description: "Established to serve Bangladesh's industrial sector." },
  { title: "First export order", description: "Grew beyond the domestic market." },
  { title: "ISO certified", description: "Adopted ISO-aligned quality-management systems." },
  { title: "New factory", description: "Upgraded facilities, machinery, and in-house testing." },
  {
    title: "500th project delivered",
    description: "A milestone reflecting sustained industrial trust.",
  },
];

const DEFAULT_INDUSTRIES: string[] = [
  "Pharmaceutical",
  "Food & Beverage",
  "Chemical",
  "Textile",
  "Power",
  "Cement",
  "Steel",
  "Oil & Gas",
  "Water Treatment",
  "Packaging",
  "Engineering",
];

const DEFAULT_CAPABILITIES: CapabilityAreaVM[] = [
  { name: "Manufacturing", description: "In-house production to specification." },
  { name: "Fabrication", description: "Custom fabrication and assembly." },
  { name: "Supply", description: "Sourcing and supply of equipment and spares." },
  { name: "Engineering", description: "Design and engineering support." },
  { name: "Installation", description: "On-site installation and integration." },
  { name: "Maintenance", description: "Preventive and corrective maintenance." },
  { name: "Commissioning", description: "Testing, start-up, and handover." },
  { name: "After-sales support", description: "Spares, service, and technical support." },
];

const DEFAULT_CERTIFICATIONS: CertificationVM[] = [
  { name: "ISO 9001:2015", detail: "Quality management system" },
  { name: "Trade License", detail: "Registered business" },
  { name: "Business Identification (BIN)", detail: "VAT-registered" },
  { name: "Tax Identification (TIN)", detail: "Registered taxpayer" },
  { name: "Import Registration (IRC)", detail: "Authorised to import" },
  { name: "Factory License", detail: "Licensed manufacturing facility" },
  { name: "Quality Standards", detail: "Compliant with applicable standards" },
  { name: "Trade Memberships", detail: "Member of industry trade bodies" },
];

const DEFAULT_GALLERY: GalleryItemVM[] = [
  { label: "Factory" },
  { label: "Workshop" },
  { label: "Installation" },
  { label: "Testing" },
  { label: "Completed Projects" },
  { label: "Products" },
  { label: "Certificates" },
];

const DEFAULT_STATS: CompanyStatVM[] = [
  { label: "Years in business", value: "15+" },
  { label: "Projects completed", value: "500+" },
  { label: "Employees", value: "100+" },
  { label: "Countries served", value: "5+" },
  { label: "Workshop area", value: "30,000 sq ft" },
];

// Editorial project seed for the Project Detail template (P-PUB-25). The four projects deliberately span
// the full-to-sparse range so the template's per-section auto-hide is exercised: "high-voltage-substation"
// populates EVERY section; the two middle projects carry different partial mixes; "food-beverage-line" is
// intentionally sparse (base fields only) so most optional sections hide and Documents falls to its honest
// empty state. All content is vendor-authored editorial (coins no platform signal); no fabricated media,
// no computed figures, role-based testimonial attribution.
const DEFAULT_PROJECTS: ProjectDetailVM[] = [
  {
    name: "High Voltage Substation",
    slug: "high-voltage-substation",
    industry: "Power",
    client: "National utility",
    namedClient: "National Grid",
    scope: "132/33kV power transformers and switchgear for grid distribution.",
    year: "2022",
    status: "completed",
    durationLabel: "6 Months",
    location: "Chittagong, Bangladesh",
    valueLabel: "BDT 12 Crore (approx.)",
    media: [
      {
        kind: "video",
        label: "Commissioning Walkthrough",
        caption: "Energisation & commissioning walkthrough",
      },
      { kind: "image", label: "132kV Switchyard Bay", caption: "132kV switchyard bay extension" },
      {
        kind: "image",
        label: "Transformer Placement",
        caption: "40 MVA power transformer positioning",
      },
      {
        kind: "image",
        label: "Control & Relay Building",
        caption: "Control & protection building",
      },
      {
        kind: "image",
        label: "Gantry Steel Erection",
        caption: "Galvanised gantry structure erection",
      },
      {
        kind: "document",
        label: "As-Built Single Line Diagram",
        caption: "As-built SLD (reference tile)",
      },
    ],
    challenge:
      "This project required comprehensive engineering oversight for a national grid client. The primary challenge involved retrofitting existing infrastructure with modern power capabilities while strictly maintaining operational uptime to avoid production losses.",
    solution:
      "Installation of 132/33kV power transformers and switchgear for efficient grid distribution and industrial power supply. To ensure precision, specialized teams handled the structural modifications and system integration simultaneously, using 3D modelling (BIM) to prevent clashes and ensure a seamless installation process.",
    result:
      "The bay was energised on schedule with zero unplanned outages to the surrounding industrial corridor. Protection tests passed on the first attempt, and the substation has run without a forced trip since handover.",
    deliverables: [
      "Structural Analysis & Design",
      "Fabrication (500 Tons)",
      "On-site Installation",
      "Procurement Grade Materials",
      "Non-Destructive Testing (NDT)",
    ],
    specifications: [
      { label: "Voltage class", value: "132 / 33 kV" },
      { label: "Transformer capacity", value: "2 × 40 MVA" },
      { label: "Structural steel", value: "500 tonnes" },
      { label: "Applicable standards", value: "IEC 61936-1" },
      { label: "Earthing design", value: "IEEE 80" },
      { label: "Acceptance testing", value: "FAT · SAT" },
    ],
    materialsEquipment: [
      "40 MVA power transformers",
      "132kV SF₆ circuit breakers",
      "33kV switchgear",
      "Galvanised lattice gantry steel",
      "Numerical protection relays",
      "Copper earthing conductor",
      "XLPE 33kV power cable",
    ],
    documents: [
      {
        title: "Certificates",
        documents: [
          { name: "Factory Acceptance Test — Transformer", fileType: "PDF" },
          { name: "Material Traceability Certificate (Steel)", fileType: "PDF" },
        ],
      },
      {
        title: "QA / QC Records",
        documents: [
          { name: "Welding Procedure Specification (WPS)", fileType: "PDF" },
          { name: "Bolt Torque & Tension Log — Gantry", fileType: "XLSX" },
        ],
      },
      {
        title: "Inspection Reports",
        documents: [
          { name: "Non-Destructive Testing (NDT) Report", fileType: "PDF" },
          { name: "Insulation Resistance Test Report", fileType: "PDF" },
        ],
      },
      {
        title: "Handover Documents",
        documents: [
          { name: "As-Built Single Line Diagram", fileType: "DWG" },
          { name: "Operation & Maintenance Manual", fileType: "PDF" },
          { name: "Energisation & Handover Certificate", fileType: "PDF" },
        ],
      },
    ],
    technologies: ["3D Modelling (BIM)", "Precision Welding", "Switchgear Integration"],
    gallery: [
      { label: "Site Preparation" },
      { label: "Gantry Erection" },
      { label: "Transformer Lift" },
      { label: "Cable Termination" },
      { label: "Protection Panels" },
      { label: "Energisation" },
    ],
    testimonial: {
      message:
        "The bay extension was delivered inside our outage windows without a single unplanned interruption to the corridor. The commissioning documentation was the cleanest handover pack our team reviewed that year.",
      attribution: "Executive Engineer, Grid Operations",
      organization: "National Grid",
    },
    equipment: ["Power transformers", "Switchgear", "Structural steel"],
    tags: ["Power", "Infrastructure"],
    imageLabel: "Substation",
  },
  {
    name: "Process plant valve supply",
    slug: "process-plant-valve-supply",
    industry: "Chemical",
    client: "Process manufacturer",
    namedClient: "Meghna Petrochemical Ltd.",
    scope: "Supply of industrial valves, actuators, and fittings for a plant upgrade.",
    year: "2023",
    status: "completed",
    durationLabel: "4 Months",
    location: "Narayanganj, Bangladesh",
    media: [
      { kind: "image", label: "Valve Assembly", caption: "Gate valve & actuator assembly" },
      { kind: "image", label: "Actuator Test", caption: "Actuator calibration bench test" },
      { kind: "image", label: "On-site Installation", caption: "Sequenced on-site fitment" },
    ],
    challenge:
      "A process plant upgrade required a phased valve and actuator replacement without shutting the line down, under strict material-traceability requirements.",
    solution:
      "Staged supply of gate valves, actuators, and flanged fittings with full material certification, sequenced around the plant's maintenance windows to keep production running.",
    result:
      "All phases were fitted within the scheduled maintenance windows with no line stoppage, and every item shipped with traceable material certification.",
    deliverables: [
      "Valve & actuator supply",
      "Material traceability certificates",
      "On-site fitment support",
    ],
    specifications: [
      { label: "Valve type", value: "Gate & flanged fittings" },
      { label: "Actuation", value: "Electric actuators" },
      { label: "Traceability", value: "Full material certification" },
    ],
    documents: [
      {
        title: "Certificates",
        documents: [{ name: "Material Traceability Certificate", fileType: "PDF" }],
      },
      {
        title: "QA / QC Records",
        documents: [{ name: "Hydrostatic Test Report", fileType: "PDF" }],
      },
    ],
    technologies: ["Material Traceability", "Actuator Calibration"],
    equipment: ["Gate valves", "Actuators", "Flanged fittings"],
    tags: ["Chemical", "Process"],
    imageLabel: "Installation",
  },
  {
    name: "Water treatment pumping",
    slug: "water-treatment-pumping",
    industry: "Water Treatment",
    client: "Municipal utility",
    namedClient: "Chattogram WASA",
    scope: "Pump supply, installation, and commissioning for a treatment facility.",
    year: "2022",
    status: "completed",
    durationLabel: "5 Months",
    location: "Chittagong, Bangladesh",
    media: [
      { kind: "image", label: "Pumping Station", caption: "Centrifugal pumping station" },
      { kind: "image", label: "Control Panel", caption: "Control-panel integration" },
      { kind: "image", label: "Commissioning", caption: "Commissioning & handover" },
    ],
    challenge:
      "A municipal treatment facility needed additional pumping capacity commissioned within a tight civil-works schedule.",
    solution:
      "Supply, installation, and commissioning of centrifugal pumps with control panels, coordinated with the civil contractor to meet the facility's cutover date.",
    deliverables: ["Pump supply", "Control-panel integration", "Commissioning & handover"],
    materialsEquipment: [
      "Centrifugal pumps",
      "Motor control panels",
      "Suction & delivery valves",
      "Instrumentation & flow meters",
    ],
    technologies: ["Pump Commissioning", "Control Panel Integration"],
    gallery: [
      { label: "Pumping Station" },
      { label: "Control Panel" },
      { label: "Pipework" },
      { label: "Commissioning" },
    ],
    testimonial: {
      message:
        "The pumps were commissioned to the facility's cutover date and have run reliably through peak demand. Coordination with our civil contractor was handled without a single schedule clash.",
      attribution: "Project Director",
      organization: "Chattogram WASA",
    },
    equipment: ["Centrifugal pumps", "Control panels"],
    tags: ["Water Treatment", "Utilities"],
    imageLabel: "Pumping station",
  },
  {
    // Deliberately SPARSE — base fields only. No media, result, value, specifications, materials,
    // technologies, documents, gallery, or testimonial: proves the template auto-hides every optional
    // section (and Documents falls to its honest empty state) with no orphan headings.
    name: "Food & beverage line",
    slug: "food-beverage-line",
    industry: "Food & Beverage",
    client: "FMCG manufacturer",
    namedClient: "Pran-RFL Group",
    scope: "Hygienic valves and stainless fittings for a production line.",
    year: "2021",
    status: "completed",
    durationLabel: "3 Months",
    location: "Gazipur, Bangladesh",
    challenge:
      "A new production line required hygienic-grade valves and stainless fittings meeting food-safety standards, delivered ahead of the line's start-up.",
    solution:
      "Supply of hygienic valves and stainless fittings to the required food-safety grade, delivered and fitted ahead of the line's commissioning date.",
    deliverables: ["Hygienic valve supply", "Stainless fitting supply", "Fitment support"],
    equipment: ["Hygienic valves", "SS fittings"],
    tags: ["Food & Beverage", "Manufacturing"],
    imageLabel: "Production line",
  },
];

const DEFAULT_DOWNLOADS: DownloadItemVM[] = [
  {
    label: "Company Profile",
    fileType: "PDF",
    description: "Overview of the company and its capabilities.",
  },
  {
    label: "Product Catalog",
    fileType: "PDF",
    description: "Full product range and specifications.",
  },
  { label: "Brochure", fileType: "PDF", description: "Quick-reference company brochure." },
  { label: "Certificates", fileType: "PDF", description: "Quality certificates and licenses." },
  {
    label: "Technical Datasheets",
    fileType: "PDF",
    description: "Datasheets for selected products.",
  },
];

const DEFAULT_FAQ: FaqItemVM[] = [
  {
    question: "What industries do you serve?",
    answer:
      "We serve a range of industrial sectors including power, water treatment, chemical, food & beverage, textile, and general engineering.",
  },
  {
    question: "Do you manufacture, or only supply?",
    answer:
      "Our capabilities are shown in the Capabilities section — depending on the product line we supply, fabricate, service, and provide engineering support.",
  },
  {
    question: "What is the minimum order quantity (MOQ)?",
    answer:
      "MOQ varies by product. Send a quote request with your requirement and we will confirm what applies.",
  },
  {
    question: "What are typical lead times?",
    answer:
      "Lead times depend on the item and quantity. Stocked items ship faster; made-to-order and imported items take longer. We confirm a timeline with every quotation.",
  },
  {
    question: "Do you supply outside Bangladesh?",
    answer:
      "Our primary market is Bangladesh; availability outside the country depends on the product. Please enquire for specific requirements.",
  },
  {
    question: "Do products come with a warranty?",
    answer:
      "Warranty terms depend on the product and manufacturer, and are confirmed at the time of quotation.",
  },
];

// Per-vendor project sets — proves the ONE Project Detail template renders entirely different portfolios
// per vendor from data alone: these two vendors resolve distinct `projects` via OVERRIDES; every other
// vendor keeps DEFAULT_PROJECTS. (The public read is unwired; these stand in for `showcase_projects`.)
const BENGAL_STEEL_PROJECTS: ProjectDetailVM[] = [
  {
    name: "Structural Steel Fabrication — Warehouse",
    slug: "structural-steel-warehouse",
    industry: "Infrastructure",
    client: "Logistics operator",
    namedClient: "Summit Logistics",
    scope: "Fabrication and erection of a pre-engineered steel warehouse.",
    year: "2023",
    status: "completed",
    durationLabel: "8 Months",
    location: "Dhaka, Bangladesh",
    valueLabel: "BDT 8 Crore (approx.)",
    media: [
      { kind: "image", label: "Fabrication Shop", caption: "In-house fabrication shop" },
      { kind: "image", label: "Primary Frame Erection", caption: "Primary frame erection" },
      {
        kind: "document",
        label: "Fabrication Drawings",
        caption: "Approved fabrication drawings (reference tile)",
      },
    ],
    challenge:
      "A 12,000 m² distribution warehouse had to be fabricated and erected on a compressed schedule, with clear-span framing to keep the floor unobstructed.",
    solution:
      "In-house fabrication of the primary and secondary steelwork with hot-dip galvanising, staged to the site's foundation programme so erection began the week foundations cured.",
    result:
      "The clear-span frame was erected two weeks inside the client's target date, handed over with full weld and coating records.",
    deliverables: [
      "Shop-drawing development",
      "Structural fabrication",
      "Hot-dip galvanising",
      "On-site erection",
    ],
    specifications: [
      { label: "Covered area", value: "12,000 m²" },
      { label: "Framing", value: "Clear-span portal" },
      { label: "Coating", value: "Hot-dip galvanised" },
      { label: "Applicable standards", value: "AISC 360" },
    ],
    materialsEquipment: [
      "Structural steel sections",
      "High-strength bolts",
      "Galvanised roof sheeting",
      "Purlins & girts",
    ],
    documents: [
      { title: "Certificates", documents: [{ name: "Mill Test Certificate", fileType: "PDF" }] },
      { title: "QA / QC Records", documents: [{ name: "Weld Inspection Log", fileType: "PDF" }] },
    ],
    technologies: ["Shop Fabrication", "Hot-dip Galvanising"],
    tags: ["Steel", "Fabrication"],
    imageLabel: "Warehouse",
  },
  {
    name: "Mezzanine Platform Package",
    slug: "mezzanine-platform-package",
    industry: "Manufacturing",
    client: "Textile manufacturer",
    scope: "Supply and install a bolted steel mezzanine for a production floor.",
    year: "2022",
    status: "completed",
    durationLabel: "3 Months",
    location: "Gazipur, Bangladesh",
    challenge: "A textile plant needed additional floor area without extending its footprint.",
    solution:
      "A bolted, demountable mezzanine designed to the plant's loading, installed over a single maintenance shutdown.",
    deliverables: ["Structural design", "Fabrication", "Bolted installation"],
    tags: ["Steel", "Manufacturing"],
    imageLabel: "Mezzanine",
  },
];

const MEGHNA_PUMP_PROJECTS: ProjectDetailVM[] = [
  {
    name: "Booster Pumping Station",
    slug: "booster-pumping-station",
    industry: "Water Treatment",
    client: "Municipal utility",
    namedClient: "Dhaka WASA",
    scope: "Supply, install and commission a booster pumping station.",
    year: "2023",
    status: "completed",
    durationLabel: "5 Months",
    location: "Dhaka, Bangladesh",
    valueLabel: "BDT 6 Crore (approx.)",
    media: [
      { kind: "image", label: "Pump Skid", caption: "Pre-assembled pump skid" },
      {
        kind: "image",
        label: "VFD Control Panel",
        caption: "Variable-frequency drive control panel",
      },
      { kind: "video", label: "Commissioning", caption: "Commissioning run" },
    ],
    challenge:
      "A distribution zone needed additional head and flow without pressure surges on start-up.",
    solution:
      "A skid-mounted booster set with variable-frequency drives and soft-start control, commissioned against the zone's demand curve.",
    result:
      "Zone pressure stabilised across peak and off-peak demand with no surge events recorded since commissioning.",
    deliverables: ["Pump supply", "VFD control panel", "Installation & commissioning"],
    specifications: [
      { label: "Configuration", value: "Duty / standby / assist" },
      { label: "Control", value: "VFD soft-start" },
      { label: "Instrumentation", value: "Pressure & flow" },
    ],
    materialsEquipment: [
      "End-suction pumps",
      "Variable-frequency drives",
      "Pressure transmitters",
      "Manifold & valves",
    ],
    documents: [
      {
        title: "Certificates",
        documents: [{ name: "Pump Test Curve Certificate", fileType: "PDF" }],
      },
      { title: "Handover Documents", documents: [{ name: "O&M Manual", fileType: "PDF" }] },
    ],
    technologies: ["VFD Control", "Skid Assembly"],
    tags: ["Pumps", "Water Treatment"],
    imageLabel: "Pump station",
  },
  {
    name: "Irrigation Pump Supply",
    slug: "irrigation-pump-supply",
    industry: "Agriculture",
    client: "Agricultural cooperative",
    scope: "Supply of diesel and electric irrigation pumps.",
    year: "2021",
    status: "completed",
    durationLabel: "2 Months",
    location: "Bogura, Bangladesh",
    challenge: "A cooperative needed reliable irrigation pumps ahead of the dry season.",
    solution:
      "Supply of matched diesel and electric pump sets with spares, delivered before the season.",
    deliverables: ["Pump supply", "Spares kit", "Operator briefing"],
    tags: ["Pumps", "Agriculture"],
    imageLabel: "Irrigation",
  },
];

/** Per-slug editorial overrides (a flagship gets hand-written content; all others use the templated
 *  default). Add entries here as curated content lands — never wired to a contract. */
const OVERRIDES: Record<string, Partial<VendorCompanyContentVM>> = {
  "bengal-steel-industries": { projects: BENGAL_STEEL_PROJECTS },
  "meghna-pumps-motors": { projects: MEGHNA_PUMP_PROJECTS },
  "padma-valve-fittings": {
    mission:
      "To keep Bangladesh's power, water, and process plants running with dependable valves and fittings — engineered to specification and supported for the long term.",
    vision:
      "To be the country's most trusted partner for industrial valves and pipeline fittings, known for engineering quality and responsive service.",
    stats: [
      { label: "Years in business", value: "20+" },
      { label: "Projects completed", value: "750+" },
      { label: "Employees", value: "120+" },
      { label: "Countries served", value: "6" },
      { label: "Workshop area", value: "45,000 sq ft" },
    ],
  },
};

/** Build the company-website editorial content for a vendor, personalised from its public profile. The
 *  result is a presentation stand-in only (coins nothing; binds no contract). */
export function getCompanyContent(profile: PublicVendorProfileVM): VendorCompanyContentVM {
  const { name, category } = profile;
  const lower = category.toLowerCase();
  const base: VendorCompanyContentVM = {
    overview: profile.about,
    businessOverview: `${name} serves industrial clients across Bangladesh with ${lower} solutions, combining in-house capability with responsive after-sales support.`,
    facilities: `The facility houses production, fabrication, and quality-control areas equipped for ${lower} work, with capacity to scale to project demand.`,
    mission: `To deliver dependable ${lower} solutions that keep Bangladesh's industries running — on time, to specification, and built to last.`,
    vision: `To be Bangladesh's most trusted partner for ${lower}, recognised for engineering quality, reliability, and long-term customer relationships.`,
    values: DEFAULT_VALUES,
    whyChooseUs: DEFAULT_WHY_CHOOSE_US,
    history: DEFAULT_HISTORY,
    management: {
      name: "Managing Director",
      title: `${name}`,
      message: `At ${name}, our focus is simple: deliver quality ${lower} solutions, on time, and stand behind them. We are grateful to the industrial partners who have grown with us, and we remain committed to earning that trust every day.`,
    },
    industries: DEFAULT_INDUSTRIES,
    capabilities: DEFAULT_CAPABILITIES,
    certifications: DEFAULT_CERTIFICATIONS,
    gallery: DEFAULT_GALLERY,
    stats: DEFAULT_STATS,
    projects: DEFAULT_PROJECTS,
    downloads: DEFAULT_DOWNLOADS,
    faq: DEFAULT_FAQ,
    contact: {
      address: profile.location ? `${profile.location}, Bangladesh` : "Bangladesh",
      hours: "Sunday – Thursday, 9:00 AM – 6:00 PM",
      mapLabel: profile.location ?? name,
    },
  };

  return { ...base, ...OVERRIDES[profile.slug] };
}

/** Resolve a single showcase project for a vendor by its slug (FE-PUB-11 detail page). Presentation
 *  stand-in for the frozen `showcase_projects` read (unwired) — returns `undefined` for an unknown
 *  slug so the route renders the byte-equivalent 404 (Invariant #11). Coins no contract. */
export function getShowcaseProject(
  profile: PublicVendorProfileVM,
  projectSlug: string,
): ProjectDetailVM | undefined {
  return getCompanyContent(profile).projects?.find((project) => project.slug === projectSlug);
}
