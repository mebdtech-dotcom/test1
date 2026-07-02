// FE-PUB-09 MEGA_MENU — category icon registry (MEGA_MENU_DATA_MODEL.md §3).
// Serializable key → Lucide glyph, same idiom as the shell's NAV_ICONS: overlay data carries a
// string key, never a component. All 13 Taxonomy Content v1.0 roots have a launch glyph (Lucide
// industrial set — DP §10 custom glyph swap is registry-only, zero component changes). Deeper
// levels inherit the root glyph by default; the neutral fallback is a plain shape.

import type { LucideIcon } from "lucide-react";
import {
  Beaker,
  Box,
  Boxes,
  Building2,
  Cog,
  Cpu,
  FlaskConical,
  Forklift,
  Gauge,
  HardHat,
  Hammer,
  Layers,
  MonitorCog,
  PlugZap,
  Shapes,
  ShieldAlert,
  Wrench,
  Zap,
} from "lucide-react";

export type CategoryIconKey =
  | "raw-materials"
  | "process-machinery"
  | "machine-tools"
  | "power-electrical"
  | "plant-utilities"
  | "fire-safety-security"
  | "automation-instrumentation"
  | "material-handling"
  | "construction-infrastructure"
  | "quality-lab"
  | "it-ot-software"
  | "mro-consumables"
  | "industrial-services"
  | "beaker"
  | "box"
  | "boxes"
  | "cog"
  | "hammer"
  | "layers"
  | "wrench"
  | "zap";

/** 13 root glyphs (keys = root slugs) + a small shared set for overlay use. */
const CATEGORY_ICONS: Record<CategoryIconKey, LucideIcon> = {
  "raw-materials": FlaskConical,
  "process-machinery": Cog,
  "machine-tools": Hammer,
  "power-electrical": PlugZap,
  "plant-utilities": Gauge,
  "fire-safety-security": ShieldAlert,
  "automation-instrumentation": Cpu,
  "material-handling": Forklift,
  "construction-infrastructure": Building2,
  "quality-lab": Beaker,
  "it-ot-software": MonitorCog,
  "mro-consumables": Wrench,
  "industrial-services": HardHat,
  beaker: Beaker,
  box: Box,
  boxes: Boxes,
  cog: Cog,
  hammer: Hammer,
  layers: Layers,
  wrench: Wrench,
  zap: Zap,
};

/** Neutral fallback when neither the node nor its root resolves a glyph. */
export const FALLBACK_CATEGORY_ICON: LucideIcon = Shapes;

export function resolveCategoryIcon(key: string | undefined): LucideIcon | undefined {
  if (!key) return undefined;
  return CATEGORY_ICONS[key as CategoryIconKey];
}
