// Vendor Organization composition (Team 3, FE-VEN-11, P-ACC-04..11). This feature folder holds
// ONLY the tab-composition adapter — the actual content is the existing, unmodified Account
// components (`app/(app)/account/organization|organization-lifecycle|members|roles|permissions|
// delegation`), imported directly by the route. No content component is duplicated here (Board
// ruling 2026-07-03, Option B — composition only, forking an Account page is Flag-and-Halt).
export { OrganizationTabs, type OrganizationTabsProps } from "./organization-tabs";
