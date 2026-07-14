// Account-settings READ screen — the Doc-7E `(app)/account` page (Doc-7E ER1/ER3, §3.1 "Account
// settings"; the buyer-profile READ leg). A Next.js SERVER COMPONENT (RSC) in the Doc-7C `(app)` route
// group. REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY — no business logic.
//
// SERVER-SIDE WIRED DATA LAYER (Doc-7C): the page reads the buyer-profile DATA via the SERVER composition
// (`src/server/identity` — session → ensureProvisioned → withActiveOrg → getBuyerProfile), NOT a client
// self-fetch of its own HTTP API. It binds the LIVE defaults (the cookie-bound Supabase session resolver
// + the concrete first-login provisioning hook) and reuses the SAME WP-1.5 composition core as the wired
// route (no logic duplication — `loadActiveOrgBuyerProfile`).
//
// OWN ACTIVE-ORG ONLY (Invariant #5 / Doc-7E ER8): the read runs inside the SERVER-RESOLVED active-org
// context (RLS-scoped); no client-supplied org id, no org-switcher (the switcher is Doc-7C — Doc-7E ER5).
//
// NON-DISCLOSURE (Doc-5C §6.3 / Doc-7A §4.3): "absent" and "cross-tenant" are collapsed by the server to
// the SAME `profile: null`; both render the identical empty state — no existence leak.
//
// READ LEG ONLY: no `upsert_buyer_profile` write/create (that is Wave 2 — Doc-7E §3.1). No Doc-7B kit
// primitive is coined (the design-system kit is Doc-7B/Wave 2). Content ≠ Presentation: this page composes
// presentation only and owns no business state/logic (that is M1).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): an `app/` file imports `src/server/*` + module `contracts/` +
// `src/shared/*` + sibling `app/` only — never a module internal, never cross-schema SQL. Here it imports
// `src/server` (auth + the data face) and a sibling presentational component only.
//
// SHELL: mounted in the canonical Platform Shell by the co-located `(index)` layout — the shell owns the
// `<main>` landmark; this page renders content only (no own `<main>` wrapper).

import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { loadActiveOrgBuyerProfile } from "@/server/identity";
import { AccountView, type AccountViewState } from "../account-view";
import { AccountBuyerProfileForm } from "../account-buyer-profile-form";

export const metadata = {
  title: "Account settings — iVendorz",
};

// Per-request server render (the read depends on the session + server-resolved active-org context).
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  // Resolve the buyer-profile DATA server-side via the WP-1.5 composition (live defaults):
  // session → ensureProvisioned → withActiveOrg((tx) => getBuyerProfile(tx)). Returns the DATA outcome,
  // never the HTTP envelope (the page renders presentation, not a wire response).
  const outcome = await loadActiveOrgBuyerProfile({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  // Map the server DATA outcome onto exactly one presentation state.
  //   unauthenticated      → the `(auth)` login affordance (Doc-7C owns the auth boundary).
  //   authenticated + null → the non-disclosure-safe empty state (absent OR cross-tenant — identical).
  //   authenticated + DTO  → the read-only buyer-profile fields.
  const state: AccountViewState = !outcome.authenticated
    ? { kind: "unauthenticated" }
    : outcome.profile === null
      ? { kind: "empty" }
      : { kind: "present", profile: outcome.profile };

  // The READ view (unchanged — form-free, per WP-1.6) PLUS the D7 write affordance below it for
  // authenticated callers (create form when absent, edit form when present). The form is a CLIENT island
  // that POSTs to `POST /api/identity/buyer_profiles`; the read view stays a pure server-rendered RSC.
  return (
    <>
      <AccountView state={state} />
      {outcome.authenticated ? <AccountBuyerProfileForm profile={outcome.profile} /> : null}
    </>
  );
}
