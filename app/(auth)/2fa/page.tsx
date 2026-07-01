// Two-factor challenge route (`/2fa`) — P-AUTH-06 (Auth template · Doc-7E §2). The second-factor
// verification step during sign-in. Binds Supabase Auth MFA (verify) — authentication only
// (Doc-7C §3.1). Unauthenticated shell; no active-org context, no session held (Doc-7C §2.1).
// Self-contained centered layout — does NOT add an `(auth)/layout.tsx`.
//
// PRESENTATION-ONLY: composes the Doc-7B kit and verifies NOTHING. GOVERNANCE:
//  • The code + the MFA challenge are SERVER-AUTHORITATIVE — client-side checks are format-only UX;
//    the page never verifies a code and never trusts one.
//  • The `?state=` preview (form/loading/error/interim) is a DEV/QA harness — honored ONLY outside
//    production, so a real visitor is never shown a fabricated system state (mirrors Search / P-AUTH-05).
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { Card } from "@/frontend/primitives/card";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = {
  title: "Two-factor authentication — iVendorz",
  description: "Enter your verification code to finish signing in.",
};

type SearchParams = { state?: string };

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // DEV/QA-only preview harness — never honored in production.
  const raw = process.env.NODE_ENV !== "production" ? sp.state : undefined;
  const preview = raw === "loading" || raw === "error" || raw === "interim" ? raw : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BrandLogo height={36} />
          </Link>
        </div>

        <Card className="p-6 shadow-iv-md sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              Two-factor authentication
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the verification code to finish signing in.
            </p>
          </div>

          <TwoFactorForm preview={preview} />
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
