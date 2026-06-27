"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client (Client Components) — public anon key only.
//
// Authentication ONLY (CLAUDE.md §2). `NEXT_PUBLIC_*` are statically inlined by Next at
// build time (literal access required), so they are read directly here rather than via a
// dynamic env helper. Values are supplied via env, never hardcoded.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
