// FE-PUB-09 MEGA_MENU — presentation overlay v1 (MEGA_MENU_DATA_MODEL.md §3).
// FE-OWNED editorial config, keyed by ACTIVE slug (build-time lint: findDeadOverlayKeys).
// Decorates only — cannot add, rename, or re-parent nodes. `featured` flags are editorial
// pending real analytics (curation moves to taxonomy governance §9 when demand data exists).
// Synonyms come from the taxonomy package's starter set v0.1 (Appendix design notes) — never
// invented ad hoc; the `menu_search_zero` analytics feed grows this dictionary over time.

import type { IndustryShortcut, PresentationOverlay } from "./types";

export const OVERLAY_V1: PresentationOverlay = {
  /* ── 13 roots: registry glyph + one-line menu description + featured curation ─────────── */
  "raw-materials": {
    icon: "raw-materials",
    description: "Chemicals, polymers, metals and other production inputs",
    featured: true,
  },
  "process-machinery": {
    icon: "process-machinery",
    description: "Production lines and process equipment by industry",
    featured: true,
  },
  "machine-tools": {
    icon: "machine-tools",
    description: "Machining, cutting, forming and fabrication equipment",
  },
  "power-electrical": {
    icon: "power-electrical",
    description: "Generation, distribution, motors, drives and lighting",
    featured: true,
  },
  "plant-utilities": {
    icon: "plant-utilities",
    description: "Steam, compressed air, water treatment and HVAC systems",
    featured: true,
  },
  "fire-safety-security": {
    icon: "fire-safety-security",
    description: "Fire protection, PPE and site security systems",
  },
  "automation-instrumentation": {
    icon: "automation-instrumentation",
    description: "PLC, SCADA, sensors, instruments and control systems",
  },
  "material-handling": {
    icon: "material-handling",
    description: "Lifting, storage, packaging and intralogistics",
  },
  "construction-infrastructure": {
    icon: "construction-infrastructure",
    description: "Civil, structural and building products & services",
  },
  "quality-lab": {
    icon: "quality-lab",
    description: "Test, measurement, lab equipment and metrology",
  },
  "it-ot-software": {
    icon: "it-ot-software",
    description: "Industrial software, networks and OT infrastructure",
  },
  "mro-consumables": {
    icon: "mro-consumables",
    description: "Spares, bearings, fasteners, tools and consumables",
    featured: true,
  },
  "industrial-services": {
    icon: "industrial-services",
    description: "EPC, maintenance, calibration and professional services",
  },

  /* ── Synonym starter set v0.1 (taxonomy package Appendix C design notes) ───────────────── */
  "diesel-generators": { synonyms: ["genset", "dg set", "generator set"] },
  "ms-gi-pipes": { synonyms: ["gi pipe", "ms pipe", "galvanized pipe"] },
  "fire-protection-epc": { synonyms: ["pfi", "fire contractor", "fire protection contractor"] },
  "industrial-acids": { synonyms: ["sulphuric acid", "hcl", "nitric acid", "phosphoric acid"] },
  "industrial-alkalis": { synonyms: ["caustic soda", "soda ash"] },
  "variable-frequency-drives": { synonyms: ["vfd", "variable speed drive", "inverter drive"] },
  "centrifugal-pumps": { synonyms: ["water pump"] },
  "butterfly-valves": { synonyms: ["bfv"] },
};

/**
 * Industry entry chips (MINOR-04) — menu-level overlay data, ≤6 rendered. Links point ONLY at
 * live surfaces (the search route exists and is the honest interim target; dedicated segment
 * landings are a future surface). Never a dead route.
 */
export const INDUSTRY_SHORTCUTS_V1: IndustryShortcut[] = [
  { label: "Pharmaceutical", href: "/search?q=pharmaceutical" },
  { label: "Food & Beverage", href: "/search?q=food" },
  { label: "Chemical", href: "/search?q=chemical" },
  { label: "Textile & RMG", href: "/search?q=textile" },
  { label: "Power & Energy", href: "/search?q=power" },
  { label: "Construction", href: "/search?q=construction" },
];
