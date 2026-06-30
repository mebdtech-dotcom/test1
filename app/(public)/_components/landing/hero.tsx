import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { CommandCenter } from "./command-center";

// Landing Hero — SEC-HERO (landing_page_spec.md §3 · Doc-7D Public surface). PURE SERVER COMPONENT:
// static marketing copy with NO client island of its own (spec §3 rendering delta). The only hydration
// in the first viewport is the embedded Command Center (§2). Exactly one <h1> for the page. The
// decorative blueprint motif is aria-hidden and encodes no data (DP §4.5). Conversion CTAs route to
// `(auth)` (Doc-7D PR5); browse CTAs stay anonymous/public.
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Decorative blueprint / technical line-art motif — restrained, brand-neutral, never data (DP §4.5). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--iv-border) 1px, transparent 1px), linear-gradient(90deg, var(--iv-border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 25%, transparent 75%)",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 25%, transparent 75%)",
          opacity: 0.5,
        }}
      />

      <div className="relative mx-auto w-full max-w-[var(--iv-content-max)] px-4 pt-20 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            The Industrial Procurement Operating System for Bangladesh
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-iv-ink-secondary">
            Source, compare, and award — from RFQ to delivery — with verified suppliers.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get started <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">Explore the marketplace</Link>
            </Button>
          </div>
        </div>

        {/* The signature centerpiece — the only interactive island in the first viewport (spec §2/§3). */}
        <div className="mt-12 pb-16 sm:mt-14 sm:pb-20">
          <CommandCenter />
        </div>
      </div>
    </section>
  );
}
