// Routing rules — presentation SEED (P-ADM-19 · Doc-7H · J-ADM-05 · `rfq.manage_routing_rule.v1`). A curated
// mock of the routing control-plane rule list standing in for the unwired read — NOT data, coins nothing.
// `routing_rules` are OWNED BY RFQ/Module 3 (BC-7), platform-owned, with a "simple" lifecycle (Doc-2 §3.4);
// the corpus does NOT enumerate rule fields ("rule definitions; parameters resolve from
// `core.system_configuration`", Doc-2:762). So the labels below are ILLUSTRATIVE, grounded in the FROZEN
// routing-governance dimensions (Doc-3 §3.3–§3.6/§5/§7 — fairness, capacity-aware routing, waves, throttle,
// prioritization); the on/off `enabled` flag is an illustrative framing of the "simple" lifecycle, not an
// enumerated status. The whole control plane is STAGE-GATED (Doc-3 §0.1/§18B operating-stage; `assist_routing`
// carries the Stage-gated marker). No score, no matching math re-derived (moat — RFQ owns selection/fairness).
import type { StatusTone } from "@/frontend/components/status-chip";

export interface RoutingRuleVM {
  /** `routing_rules.id` — opaque platform id (no human_ref); display only. */
  id: string;
  /** Illustrative rule label, grounded in a frozen routing-governance dimension (Doc-3). */
  label: string;
  /** One-line summary of the control-plane dimension — display only. */
  summary: string;
  /** Illustrative on/off framing of the "simple" lifecycle (Doc-2 §3.4) — not an enumerated status. */
  enabled: boolean;
}

export const ROUTING_STATE_META: Record<"on" | "off", { label: string; tone: StatusTone }> = {
  on: { label: "Enabled", tone: "success" },
  off: { label: "Disabled", tone: "neutral" },
};

export const ROUTING_RULES: RoutingRuleVM[] = [
  {
    id: "rr-capacity-aware",
    label: "Capacity-aware routing",
    summary: "Weights invitations by verified capacity so no vendor is over-invited (Doc-3 §3.4).",
    enabled: true,
  },
  {
    id: "rr-fairness-rotation",
    label: "Fairness rotation",
    summary: "Rotates selection so it is never always-the-same and never pure-random (Doc-3 §3.3).",
    enabled: true,
  },
  {
    id: "rr-wave-sizing",
    label: "Wave sizing & replenishment",
    summary: "Sizes distribution waves and replenishes as invitations lapse (Doc-3 §5).",
    enabled: true,
  },
  {
    id: "rr-self-throttle",
    label: "Vendor self-throttle",
    summary:
      "Honours a vendor’s self-set throttle window with no response-rate penalty (Doc-3 §3.5).",
    enabled: true,
  },
  {
    id: "rr-prioritization",
    label: "Prioritization weighting",
    summary: "Applies the governed prioritization weighting to ordering (Doc-3 §7).",
    enabled: false,
  },
];
