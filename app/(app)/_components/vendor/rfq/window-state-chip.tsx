// Window sub-state chip (companion §7.1, Invariant 4) — a SECOND, independent chip orthogonal to the
// Doc-4M RFQ/quotation state.
//
// ⚠ DERIVED UI CONCEPT — NOT A DOMAIN STATE. `WindowState` (open / open_late / closed) is a
// PRESENTATION-DERIVED affordance ([ESC-7B-WINDOW-CHIP], pending kit addition); it is NOT a Doc-4M
// token and has NO backend enum. Do NOT bind a contract/database enum to this type, and do NOT add it
// to the Doc-4M state machines. It is computed by the caller from the RFQ's response-window timing
// (deadline + now), never persisted as a domain state. The Doc-4M RFQ/quotation/invitation tokens live
// in `state-chips.tsx`; this is a separate, orthogonal axis.
//
// The deadline is a server-formatted label (Asia/Dhaka / BST) and any urgency tier is caller/server-
// supplied — there is no client clock in the presentation phase (no live countdown). RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { WindowState, WindowUrgency } from "./types";

const BASE: Record<WindowState, { tone: StatusTone; label: string }> = {
  open: { tone: "info", label: "Open" },
  open_late: { tone: "warning", label: "Open · late" },
  closed: { tone: "neutral", label: "Closed" },
};

// Urgency only escalates the tone of an OPEN window (companion: warning <24h, danger <2h).
const URGENCY_TONE: Record<WindowUrgency, StatusTone> = {
  normal: "info",
  soon: "warning",
  imminent: "danger",
};

export interface WindowStateChipProps {
  state?: WindowState;
  deadlineLabel?: string;
  urgency?: WindowUrgency;
}

export function WindowStateChip({ state, deadlineLabel, urgency }: WindowStateChipProps) {
  if (!state) return null;
  const base = BASE[state];
  const tone = state === "open" && urgency ? URGENCY_TONE[urgency] : base.tone;
  const label = deadlineLabel ? `${base.label} — ${deadlineLabel}` : base.label;
  return <StatusChip tone={tone} label={label} />;
}
