import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client (RSC / Route Handler / Server Action) — cookie-bound session.
//
// Authentication ONLY (CLAUDE.md §2: Supabase Auth = authentication). Authorization
// (check_permission, server-validated active-org context, org-scoped guards) is NOT here —
// it lives in src/server/authz + src/server/guards and lands with M1 (Wave 2).
//
// Config is read from env at call time; never hardcoded (CLAUDE.md §2). Uses the public
// anon key only — privileged (service-role) access is not wired at bootstrap.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Invoked from a Server Component where cookies are read-only; session
            // refresh is handled by middleware in later waves. Safe to ignore.
          }
        },
      },
    },
  );
}
