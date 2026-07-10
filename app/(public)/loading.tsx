import { Skeleton } from "@/frontend/primitives/skeleton";
import { Container } from "@/frontend/components/container";

// Doc-7C SR7 — `(public)` route-segment loading boundary (suspense fallback). Presentation-only
// skeleton (Doc-7B BR9); fetches/infers nothing — a visual placeholder while RSC reads stream.
export default function PublicLoading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </Container>
  );
}
