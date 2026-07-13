// Buyer Workspace — identity PLACEHOLDER (Doc-7C SR3, `get_active_context` — PARKED). A single source for
// the neutral identity fixture shared by the shell (`layout.tsx`) and any page-level surface that greets
// the user (e.g. the P-BUY-01 dashboard welcome band) — so the two never drift into two independent
// fabrications of "who is signed in". Replaced by the real wired context at integration (Inv #5: the
// client never asserts org identity; this is a server-side placeholder only).
export const BUYER_IDENTITY_SEED = {
  userName: "Your account",
  orgName: "Active organization",
} as const;
