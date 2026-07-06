# WI — Production Build EPERM (root cause found; fix choice Board-gated)

**Status:** DIAGNOSED 2026-07-06 (owner-directed independent work item) · fix selection awaits owner
**Symptom:** `next build` fails during webpack compile: `EPERM: operation not permitted, scandir
'C:\Users\<user>\Application Data'` (or `\Cookies`) — the legacy Windows profile junctions.
Pre-existed the repo-structure package (verified identical on the pre-branch tree); occurs on both
pnpm- and npm-installed `node_modules`.

## Root cause (confirmed by diagnostic build)

1. `src/shared/db/index.ts` imports PrismaClient from
   `../../../generated-contracts-registry/prisma` — a **relative path import**, realizing the
   frozen Doc-6A §11.4 mandate (codegen output in `generated-contracts-registry/`, gitignored).
2. Next.js externalizes Prisma only under its package specifier (`@prisma/client` is in the
   default `serverExternalPackages`); a path import is **not matched**, so webpack **bundles the
   Prisma runtime** (`runtime/library.js`) into the server build.
3. Prisma's runtime is the only dependency code using `os.homedir()` (grep-verified across all
   runtime deps). During compile, Next's `TraceEntryPointsPlugin` (`compilation.hooks.finishModules`)
   runs `@vercel/nft` over the bundled server entries; nft statically evaluates the homedir-based
   dynamic requires and expands a wildcard rooted at `C:\Users\<user>`.
4. nft's vendored glob v7 walks the profile and dies on the `Application Data`/`Cookies`
   junctions (always EPERM). The repo lives on `E:` while the profile is on `C:`, so nft's
   base-root clamping (`outputFileTracingRoot`) cannot contain the cross-drive path — pinning
   the tracing root was tested and does not help.

**Diagnostic proof:** temporarily switching the import to `@prisma/client` (externalized) made the
EPERM disappear — the build passed webpack compile and reached type checking (which failed only
because the default-location client stub has no generated types). Edit reverted; tree clean.

## Fix options (all touch ratified surfaces → owner/Board pick)

| # | Option | Trade-off |
|---|---|---|
| A | Second generator target (or output move) so the client also lands at the default `node_modules/.prisma/client`, import via `@prisma/client` | Cleanest runtime story; **touches the Doc-6A §11.4 output mandate** → additive patch + Board |
| B | `next.config.ts` webpack `externals` exception for the registry path + `outputFileTracingIncludes` for deploy | Config-only, but Wave-0 config charter is "no business config"; absolute-path externals complicate deployment |
| C | Upgrade Next.js (newer `@vercel/nft` may fix the Windows cross-drive escape) | Uncertain payoff; version-pin review |
| D | Environmental: co-locate repo and profile on one drive | No code change; per-machine, not a real fix |

**Recommendation:** Option A (a `prisma generate` dual-output is additive and conforms — the
registry copy remains the contracts source; the default copy exists solely so Next's standard
externalization applies).

## Related, separate item

The previously known shell `useSearchParams` prod-build breakage (Board agenda #16) sits *behind*
this failure — once EPERM is fixed, expect prerender to surface it. Track independently.

## Environment note

`node_modules` was reinstalled with **npm** (2026-07-06) per the G1 ask-② ruling (Option A);
the previous on-disk tree was still a pnpm virtual-store install.
