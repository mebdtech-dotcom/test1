// THROWAWAY preview for Platform P-4 (badge contrast) + P-5 (CardTitle heading) validation. Deleted after.
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";

const TONES: { tone: StatusTone; label: string }[] = [
  { tone: "neutral", label: "Draft" },
  { tone: "info", label: "Submitted" },
  { tone: "success", label: "Awarded" },
  { tone: "warning", label: "Pending approval" },
  { tone: "danger", label: "Overdue" },
  { tone: "brand", label: "Reviewing" },
];

export default function PreviewPlatformFixes() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-6">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Platform fix preview</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {TONES.map((t) => (
          <StatusChip key={t.tone} label={`${t.label} (${t.tone})`} tone={t.tone} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Price breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
            CardTitle now renders a real heading (default h2) — P-5.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Delivery terms</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
            Status chips above use the darker `*-muted` ink — P-4.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
