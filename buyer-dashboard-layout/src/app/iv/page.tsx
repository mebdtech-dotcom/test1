import {
  CheckCircle2,
  FileSearch,
  FileText,
  Inbox,
  Info,
  Star,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { IvEmptyState } from "@/components/iv/iv-empty-state";
import { IvField } from "@/components/iv/iv-field";
import { IvFileLink } from "@/components/iv/iv-file-link";
import { IvFormField } from "@/components/iv/iv-form-field";
import { IvMoney } from "@/components/iv/iv-money";
import { IvNotFound } from "@/components/iv/iv-not-found";
import { IvStat } from "@/components/iv/iv-stat";

export default function IvPrimitivesPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          iVendorz pure primitives
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Prop-driven, tokens-only presentation primitives. They render — they do not decide. All
          content below is passed in by this page.
        </p>
      </header>

      <Section
        title="iv-button"
        hint="Variants primary/secondary/ghost/destructive, sizes sm/md/lg, asChild + loading. Tokens only, AA focus ring."
      >
        <div className="flex flex-wrap items-center gap-3">
          <IvButton variant="primary">Primary</IvButton>
          <IvButton variant="secondary">Secondary</IvButton>
          <IvButton variant="ghost">Ghost</IvButton>
          <IvButton variant="destructive">Destructive</IvButton>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <IvButton size="sm">Small</IvButton>
          <IvButton size="md">Medium</IvButton>
          <IvButton size="lg">Large</IvButton>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <IvButton loading>Loading</IvButton>
          <IvButton disabled>Disabled</IvButton>
          <IvButton asChild variant="secondary">
            <a href="#iv-button">As link (asChild)</a>
          </IvButton>
        </div>
      </Section>

      <Section
        title="iv-chip"
        hint="Generic chip — caller supplies tone + content. Color is never the only signal."
      >
        <div className="flex flex-wrap items-center gap-2">
          <IvChip tone="neutral">
            <Inbox aria-hidden="true" /> Neutral
          </IvChip>
          <IvChip tone="primary">Primary</IvChip>
          <IvChip tone="success">
            <CheckCircle2 aria-hidden="true" /> Success
          </IvChip>
          <IvChip tone="warning">
            <TriangleAlert aria-hidden="true" /> Warning
          </IvChip>
          <IvChip tone="info">
            <Info aria-hidden="true" /> Info
          </IvChip>
          <IvChip tone="amber">
            <Star aria-hidden="true" /> Award
          </IvChip>
          <IvChip tone="destructive">
            <XCircle aria-hidden="true" /> Error
          </IvChip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IvChip tone="success" variant="solid">
            Solid
          </IvChip>
          <IvChip tone="info" variant="outline">
            Outline
          </IvChip>
          <IvChip tone="amber" variant="solid">
            <Star aria-hidden="true" /> High value
          </IvChip>
        </div>
      </Section>

      <Section
        title="iv-money"
        hint="Renders {amount, currency} exactly. Default currency is BDT — no Intl, no $/USD assumption."
      >
        <div className="flex flex-wrap items-center gap-6 text-foreground">
          <IvMoney amount="1,250.00" />
          <IvMoney amount="1,250.00" currency="USD" />
          <IvMoney
            amount="89,999"
            currency="BDT"
            currencyPosition="trailing"
            className="text-lg font-semibold"
          />
        </div>
      </Section>

      <Section
        title="iv-stat"
        hint="Generic metric shell — value passed in fully formed (here via iv-money + iv-chip)."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <IvStat label="Gross volume" value={<IvMoney amount="4,82,300" />} />
          <IvStat
            label="Open orders"
            value="128"
            hint={
              <IvChip tone="info" className="text-[11px]">
                live
              </IvChip>
            }
          />
          <IvStat
            label="Awarded"
            value="12"
            hint={
              <IvChip tone="amber" className="text-[11px]">
                <Star aria-hidden="true" /> top tier
              </IvChip>
            }
          />
        </div>
      </Section>

      <Section
        title="iv-field"
        hint="Label + control + description + error with ARIA wiring. No validation — error is caller-supplied."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <IvField
            htmlFor="iv-demo-email"
            label="Email"
            description="We never share this."
            required
          >
            <Input id="iv-demo-email" type="email" placeholder="you@example.com" />
          </IvField>
          <IvField htmlFor="iv-demo-code" label="Vendor code" error="This code is required.">
            <Input id="iv-demo-code" aria-invalid placeholder="e.g. IV-0001" />
          </IvField>
        </div>
      </Section>

      <Section
        title="iv-form-field"
        hint="Self-contained label + input + hint + error. Renders the error string only — no validation inside."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <IvFormField
            id="iv-ff-name"
            label="Full name"
            hint="As it appears on your trade license."
            placeholder="Jane Doe"
            required
          />
          <IvFormField
            id="iv-ff-phone"
            label="Phone"
            error="Enter a valid phone number."
            defaultValue="12"
          />
        </div>
      </Section>

      <Section
        title="iv-file-link"
        hint="Carries a fileRef only — no URL/path. Resolution is the app's job via onActivate."
      >
        <IvFileLink fileRef="ref_abc123" label="Quotation.pdf" icon={<FileText />} />
      </Section>

      <Section
        title="iv-empty-state"
        hint="Generic empty shell. A not-found must look byte-identical to a genuine empty result."
      >
        <IvEmptyState
          icon={<Inbox />}
          title="Nothing to show"
          description="There are no results for the current view."
          action={<Button variant="outline">Refresh</Button>}
        />
      </Section>

      <Section
        title="iv-not-found"
        hint="Identical whether a record is absent or hidden. Generic copy + optional caller reference id only."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <IvNotFound icon={<FileSearch />} />
          <IvNotFound icon={<FileSearch />} referenceId="REQ-7Q2F-PX" />
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-sm font-medium text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground text-pretty">{hint}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
