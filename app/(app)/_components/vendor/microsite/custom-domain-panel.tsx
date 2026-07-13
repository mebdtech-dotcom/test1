// S13 Custom Domain — presentation-only. ENTITLEMENT-GATED: the custom_domain entitlement is a
// BOOLEAN resolved server-side (Doc-5I resolve_entitlements) — never a plan-name check (DP6 /
// Invariant 10). Without it, a neutral gated panel points to Billing. With it, the FROZEN four-state
// lifecycle (pending → verified → active → released, Doc-4M) renders read-only with disabled
// lifecycle actions; the domain field locks once a request is past `pending`. No DNS management UI.
import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { FormField } from "@/frontend/components/form-field";
import { PresentationContextBanner } from "./presentation-context-banner";
import { DomainStatusChip } from "./status-chips";
import { DescriptionList, type DescriptionItem, PresentationFormNote } from "../shared";
import type { CustomDomainView } from "./types";

export interface CustomDomainPanelProps {
  domain?: CustomDomainView;
  billingHref?: string;
}

export function CustomDomainPanel({
  domain,
  billingHref = "/sell/billing",
}: CustomDomainPanelProps) {
  const entitled = domain?.entitlement === true;

  if (!entitled) {
    return (
      <div className="space-y-6">
        <PresentationContextBanner />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Lock aria-hidden="true" className="size-6 text-muted-foreground" />
            <p className="text-base font-medium text-foreground">Custom domain isn’t enabled</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Connecting your own domain requires the custom-domain entitlement on your plan.
            </p>
            <Button asChild variant="outline">
              <Link href={billingHref}>Manage in Billing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = domain?.status;
  const locked = Boolean(status && status !== "pending");
  const details: DescriptionItem[] = [
    { label: "Verification record", value: domain?.verification_token },
    { label: "Verified at", value: domain?.verified_at },
  ];

  return (
    <div className="space-y-6">
      <PresentationContextBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe aria-hidden="true" className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Custom domain</p>
        </div>
        <DomainStatusChip status={status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="requested-domain"
            label="Your domain"
            description="Enter the domain you want to connect, then add the verification record at your DNS provider."
          >
            <Input
              id="requested-domain"
              name="domain"
              defaultValue={domain?.domain ?? ""}
              placeholder="www.yourcompany.com"
              readOnly={locked}
            />
          </FormField>

          <DescriptionList items={details} />

          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button type="button" disabled>
              Request domain
            </Button>
            <Button type="button" variant="outline" disabled>
              Activate
            </Button>
            <Button type="button" variant="ghost" disabled>
              Release domain
            </Button>
          </div>
          <PresentationFormNote />
        </CardContent>
      </Card>
    </div>
  );
}
