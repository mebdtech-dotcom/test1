// Account-settings READ view — PRESENTATION ONLY (Content ≠ Presentation, Invariant #9 / Doc-7A §6.2).
// This component owns NO business state or logic (that is M1 — Doc-5C); it renders the DATA the server
// page (`page.tsx`) resolves via the Doc-7C server-side wired data layer. It is a pure function of its
// props so it renders deterministically server-side (RSC) and is statically verifiable (the WP-1.6 axe
// a11y check renders the empty state without a live session).
//
// SCOPE (Doc-7E ER1/ER3, §3.1 "Account settings" row): the READ leg of the buyer-profile account screen
// only. The `upsert_buyer_profile` WRITE/create leg is Wave 2 (Doc-7E §3.1 / out of this WP) — no form,
// no edit, no create affordance here. No org-switcher (Doc-7E ER5 — that is Doc-7C). No Doc-7B kit
// primitive is coined: minimal LOCAL Tailwind presentation only (the design-system kit is Doc-7B/Wave 2).
//
// NON-DISCLOSURE (Doc-5C §6.3 / Doc-7A §4.3): "absent" and "cross-tenant" arrive here as the SAME
// `profile: null` — the server already collapsed them. This view therefore renders ONE empty state for
// both; it never branches on, or leaks, whether a profile is genuinely absent vs cross-tenant.
//
// A11Y (CHK-8-061 / Doc-7A WCAG-AA): landmark `<section aria-labelledby>` + a single `<h1>` per state,
// a `<dl>` term/definition list for the read-only fields, and text-not-color status. Renders with 0
// automatically-detectable axe violations (verified for the empty state in `tests/e2e`).

import type { BuyerProfileView } from "@/modules/identity/contracts";

/** Discriminated presentation state — the page maps the server DATA outcome onto exactly one of these. */
export type AccountViewState =
  | { kind: "unauthenticated" }
  | { kind: "empty" }
  | { kind: "present"; profile: BuyerProfileView };

/**
 * Render the account-settings read view for one presentation state. Pure: no fetching, no mutation, no
 * client state — presentation of already-resolved DATA only.
 */
export function AccountView({ state }: { state: AccountViewState }) {
  if (state.kind === "unauthenticated") {
    return <UnauthenticatedView />;
  }
  if (state.kind === "empty") {
    return <EmptyView />;
  }
  return <PresentView profile={state.profile} />;
}

/**
 * Unauthenticated affordance — the `(auth)` login entry (Doc-7C §3 owns the auth boundary; the account
 * shell only links to it). No active-org context exists pre-authentication (Doc-7E ER8).
 */
function UnauthenticatedView() {
  return (
    <section aria-labelledby="account-heading" className="mx-auto max-w-2xl p-6">
      <h1 id="account-heading" className="text-xl font-semibold text-neutral-900">
        Account settings
      </h1>
      <p className="mt-3 text-sm text-neutral-700">Sign in to view your account settings.</p>
      <p className="mt-4">
        <a
          href="/login"
          className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Go to sign in
        </a>
      </p>
    </section>
  );
}

/**
 * Empty state — the active org has no buyer profile (OR the target is cross-tenant; the server collapsed
 * both to the same `null`, so this state is rendered identically for both — non-disclosure). The
 * create/`upsert` flow is Wave 2 (Doc-7E §3.1), so NO create affordance is offered here.
 */
function EmptyView() {
  return (
    <section aria-labelledby="account-heading" className="mx-auto max-w-2xl p-6">
      <h1 id="account-heading" className="text-xl font-semibold text-neutral-900">
        Account settings
      </h1>
      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-8 text-center">
        <p className="text-base font-medium text-neutral-900">No buyer profile yet</p>
        <p className="mt-2 text-sm text-neutral-600">
          Your organization does not have a buyer profile to display.
        </p>
      </div>
    </section>
  );
}

/**
 * Present state — render the active-org buyer-profile fields READ-ONLY. The jsonb fields
 * (`factoryInfo`/`deliveryLocations`/`procurementPreferences`) carry an upstream-owned opaque shape
 * (Doc-2 §10.2; typed `unknown` on the DTO), so they are surfaced as read-only serialized text — the
 * view never reshapes module-owned content (Doc-4A §10.1 / Doc-7A §6.2).
 */
function PresentView({ profile }: { profile: BuyerProfileView }) {
  return (
    <section aria-labelledby="account-heading" className="mx-auto max-w-2xl p-6">
      <h1 id="account-heading" className="text-xl font-semibold text-neutral-900">
        Account settings
      </h1>
      <dl className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        <ReadOnlyRow label="Industry" value={profile.industry ?? "—"} />
        <ReadOnlyRow label="Factory information" value={serialize(profile.factoryInfo)} />
        <ReadOnlyRow label="Delivery locations" value={serialize(profile.deliveryLocations)} />
        <ReadOnlyRow
          label="Procurement preferences"
          value={serialize(profile.procurementPreferences)}
        />
      </dl>
    </section>
  );
}

/** One read-only field row — a `<dt>`/`<dd>` term/definition pair (a11y-correct definition list). */
function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-neutral-600">{label}</dt>
      <dd className="text-sm text-neutral-900 sm:col-span-2">
        <span className="whitespace-pre-wrap break-words">{value}</span>
      </dd>
    </div>
  );
}

/**
 * Serialize an upstream-owned opaque jsonb value (Doc-2 §10.2; `unknown` on the DTO) to read-only display
 * text. Presentation-only: it never reshapes or interprets the content — empty/null renders as "—".
 */
function serialize(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    return value.length > 0 ? value : "—";
  }
  return JSON.stringify(value);
}
