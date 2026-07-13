// Buyer Workspace — SealedMarker re-export shim. PROMOTED to the Doc-7B kit (Shared Platform Component
// Registry §4.2 CTO override — 2026-07-03): `@/frontend/components/sealed-marker` is now the single
// canonical implementation. Kept as a re-export so existing buyer imports (`./sealed-marker`) continue to
// resolve unchanged — zero behavior change. New code should import from the kit directly.
export { SealedMarker } from "@/frontend/components/sealed-marker";
