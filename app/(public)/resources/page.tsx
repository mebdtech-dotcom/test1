import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Container } from "@/frontend/components/container";

// Public Resources route (`/resources`) — P-PUB-23 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-23). A pure SERVER COMPONENT mounted in the Doc-7C `(public)` shell,
// footer-reached. ROUTING + COMPOSITION ONLY. (Path note: /vendors/[slug]/resources is the distinct
// vendor-microsite sub-page; this is the top-level Resources hub.)
//
// SCOPE: SEO STUB — anonymous, static, SEO-indexable. There is NO content / CMS contract, so NOTHING is
// fabricated: no posts, authors, dates, categories, or counts are invented. The page shows an honest
// "coming soon" state; the future content read is deferred ([ESC-7-API]). Binds no Doc-5 contract. This
// page owns the single `<h1>`.
export const metadata = {
  title: "Resources — iVendorz",
  description:
    "Guides and articles on industrial procurement in Bangladesh — coming soon to iVendorz.",
};

export default function ResourcesPage() {
  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-iv-brand-600">
            Resources
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            Procurement resources
          </h1>
          <p className="mx-auto mt-5 text-lg text-iv-ink-secondary">
            Practical guides and articles on sourcing, RFQs, and working with verified suppliers —
            written for industrial teams in Bangladesh.
          </p>
        </div>
      </section>

      {/* Coming soon. */}
      <section className="bg-muted/30">
        <Container className="py-16">
          <EmptyState
            icon={<BookOpen aria-hidden="true" />}
            title="Resources are coming soon"
            description="Guides and articles will appear here. In the meantime, see how procurement works on iVendorz or start exploring the marketplace."
            action={
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild className="gap-2">
                  <Link href="/how-it-works">
                    See how it works <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/marketplace">Explore the marketplace</Link>
                </Button>
              </div>
            }
          />
        </Container>
      </section>
    </>
  );
}
