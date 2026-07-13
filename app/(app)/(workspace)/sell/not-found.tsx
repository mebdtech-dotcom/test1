// Workspace not-found boundary (Doc-7C SR7 / Doc-7A §8.2). BYTE-IDENTICAL whether the target is
// genuinely absent or merely not visible to the caller — the kit NotFound takes no discriminating
// prop (Invariant 11 / GR11). Presentation-only.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { NotFound } from "@/frontend/components/not-found";

export default function WorkspaceNotFound() {
  return (
    <div className="py-8">
      <NotFound
        action={
          <Button asChild variant="outline">
            <Link href="/sell/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
