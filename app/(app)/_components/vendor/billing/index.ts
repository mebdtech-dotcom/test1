// Vendor Billing composition (Team 3, FE-VEN-10, P-ACC-16..21). This feature folder holds ONLY the
// tab-composition adapter — the actual billing content is the existing, unmodified Account
// components (`app/(app)/account/billing|subscription|usage|lead-credits|invoices`), imported
// directly by the route. No content component is duplicated here (Board ruling 2026-07-03, Option
// B — composition only, forking an Account page is Flag-and-Halt).
export { BillingTabs, type BillingTabsProps } from "./billing-tabs";
