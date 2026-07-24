"use client";

// Retry control for a failed read. `router.refresh()` re-invokes the SERVER component — it performs the
// actual read again through the adapter seam rather than reloading the browser, so the recovery is a real
// retry and not a page bounce. Deliberately no spinner animation: the Motion Standard forbids incidental
// motion, so the busy state is carried by the disabled state and the label alone.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

export function RetryButton({ label = "Retry" }: { label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button size="sm" disabled={isPending} onClick={() => startTransition(() => router.refresh())}>
      <RotateCw aria-hidden />
      {isPending ? "Retrying…" : label}
    </Button>
  );
}
