import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AccountView } from "../../app/(app)/account/account-view";
import type { BuyerProfileView } from "../../src/modules/identity/contracts";

// WP-1.6 [W1-FE-001] render check — the Doc-7E account-settings READ view (the buyer-profile read leg).
//
// A11Y / RENDER PATH TAKEN (reported in the WP): the account PAGE renders only inside a SERVER-RESOLVED
// active-org context and constructs a Supabase client from env (Doc-7E ER8 / Doc-7C §3) — it strictly
// requires a live authenticated session (+ Supabase env) to reach the authenticated empty/present states
// through the served route. Faking a session to drive the served route would VIOLATE the auth boundary
// (Doc-7C §3.1; CLAUDE.md §5); the e2e CI job provisions no Supabase env. So the full login → screen axe
// E2E is **WP-1.7**. Here we verify the PURE presentational view (Content ≠ Presentation, Invariant #9)
// deterministically via `react-dom/server` (no DOM, no session, no auth boundary): all three states render
// the a11y-load-bearing scaffolding (a single `<h1>`, a landmark `<section aria-labelledby>` whose target
// matches the heading id) and the correct copy.
//
// BOUNDARY: a test may import the `app` presentation layer it exercises (eslint `tests → app`, WP-1.6
// test-infra refinement) + module `contracts/` (the `BuyerProfileView` TYPE). No module internal is touched.

/** Assert the single accessible landmark/heading scaffold every state shares (WCAG-AA; CHK-8-061). */
function expectAccessibleShell(html: string): void {
  // Exactly one top-level heading.
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  expect(h1Count).toBe(1);
  // The landmark region is labelled by the heading (aria-labelledby target === the h1 id).
  expect(html).toContain('aria-labelledby="account-heading"');
  expect(html).toContain('id="account-heading"');
  expect(html).toContain("Account settings");
}

describe("WP-1.6 AccountView — Doc-7E account-settings READ view (presentation only)", () => {
  it("EMPTY state: renders the non-disclosure-safe empty state and NO create/upsert affordance (Wave 2)", () => {
    const html = renderToStaticMarkup(<AccountView state={{ kind: "empty" }} />);
    expectAccessibleShell(html);
    // The non-disclosure-safe empty copy (absent === cross-tenant — Doc-5C §6.3; same render).
    expect(html).toContain("No buyer profile yet");
    // READ LEG ONLY: no create/upsert affordance leaks in (the write leg is Wave 2 — Doc-7E §3.1).
    expect(html.toLowerCase()).not.toContain("create");
    expect(html.toLowerCase()).not.toContain("upsert");
    expect(html).not.toContain("<form");
  });

  it("UNAUTHENTICATED state: renders the (auth) login affordance, no profile data", () => {
    const html = renderToStaticMarkup(<AccountView state={{ kind: "unauthenticated" }} />);
    expectAccessibleShell(html);
    // Links to the Doc-7C `(auth)` login boundary (the account shell only links to it — ER5/Doc-7C).
    expect(html).toContain('href="/login"');
    expect(html).toContain("Sign in");
  });

  it("PRESENT state: renders the buyer-profile fields READ-ONLY (no inputs, no reshaping of jsonb)", () => {
    const profile: BuyerProfileView = {
      id: "01920000-0000-7000-8000-0000000000aa",
      organizationId: "01920000-0000-7000-8000-0000000000bb",
      industry: "textiles",
      factoryInfo: { units: 2 },
      deliveryLocations: ["Dhaka"],
      procurementPreferences: { lead_time_days: 14 },
    };
    const html = renderToStaticMarkup(<AccountView state={{ kind: "present", profile }} />);
    expectAccessibleShell(html);
    // Read-only term/definition list (no inputs — the write leg is Wave 2).
    expect(html).toContain("<dl");
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<form");
    // The field labels + values render (jsonb surfaced as read-only text, never reshaped).
    expect(html).toContain("Industry");
    expect(html).toContain("textiles");
    expect(html).toContain("Delivery locations");
    expect(html).toContain("Dhaka");
  });

  it("PRESENT state: a null industry renders the empty-value placeholder, not a leak", () => {
    const profile: BuyerProfileView = {
      id: "01920000-0000-7000-8000-0000000000aa",
      organizationId: "01920000-0000-7000-8000-0000000000bb",
      industry: null,
      factoryInfo: null,
      deliveryLocations: null,
      procurementPreferences: null,
    };
    const html = renderToStaticMarkup(<AccountView state={{ kind: "present", profile }} />);
    expectAccessibleShell(html);
    expect(html).toContain("—");
  });
});
