"use client";

// Route error boundary (Doc-7C SR7 / Doc-7A §5.3; companion §7.2 pattern 3). A route-level JS error
// is not a contract `error_class`, so it renders the neutral INTERNAL error-state with a retry.
// Protected/private resources resolve to not-found (DP2) — never to an AUTHORIZATION error-state.
// Presentation-only; reuses the kit ErrorState.
import { Button } from "@/frontend/primitives/button";
import { ErrorState } from "@/frontend/components/error-state";

export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        errorClass="INTERNAL"
        message="This view couldn’t be loaded. Please try again."
        action={
          <Button type="button" variant="outline" onClick={() => reset()}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
