// Documents shared home — the SINGLE document-kind → icon mapping (FE-DOC, owner Round-2 NIT-03).
// Every FE-DOC surface resolves its document iconography here so visual identity never diverges;
// inline per-surface lucide picks for a document kind are a review finding.
//
// KEYS: the frozen BC-OPS-2 kinds (`loi | po | challan | wcc` — Doc-4F §F5 / Doc-2 §10.5) + the
// frozen sibling aggregates (`trade_invoice`, `payment_record`) + the M3 lifecycle entities
// (`rfq`, `quotation`) + `generated` (a BC-OPS-4 rendered artifact). Generated documents'
// `doc_kind` is an AS-PROJECTED STRING on the wire (Doc-4F §F7.3), not an enum — unknown values
// fall back to `DEFAULT_DOCUMENT_ICON`; this map claims no value set.

import {
  BadgeCheck,
  Banknote,
  ClipboardList,
  FileCheck,
  FileSignature,
  FileStack,
  FileText,
  Receipt,
  Truck,
  type LucideIcon,
} from "lucide-react";

export const DOCUMENT_ICON_MAP = {
  rfq: ClipboardList,
  quotation: FileText,
  loi: FileSignature,
  po: FileCheck,
  challan: Truck,
  wcc: BadgeCheck,
  trade_invoice: Receipt,
  payment_record: Banknote,
  generated: FileStack,
} as const satisfies Record<string, LucideIcon>;

export type DocumentIconKey = keyof typeof DOCUMENT_ICON_MAP;

/** Fallback for as-projected kind strings the map does not know (never invent a kind to match). */
export const DEFAULT_DOCUMENT_ICON: LucideIcon = FileText;

/** Resolve a kind key (frozen or as-projected) to its icon — unknowns get the default, never a throw. */
export function documentIcon(kind: string | undefined): LucideIcon {
  if (kind && kind in DOCUMENT_ICON_MAP) return DOCUMENT_ICON_MAP[kind as DocumentIconKey];
  return DEFAULT_DOCUMENT_ICON;
}
