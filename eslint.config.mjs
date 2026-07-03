import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

// ESLint 9 flat config.
//  - Next.js base (core-web-vitals + typescript) via FlatCompat.
//  - eslint-plugin-boundaries enforces the One-Module-One-Owner import boundary
//    (REPOSITORY_STRUCTURE §3/§9/§10): cross-module imports ONLY via a module's contracts/.
const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "generated-contracts-registry/**",
      "src/generated/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      // Standalone v0 design-reference project (its own package.json/deps, not installed in this
      // workspace) — a style/token reference only, not part of the governed app.
      "buyer-dashboard-layout/**",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Import-boundary enforcement (the load-bearing architectural guard).
  {
    files: [
      "src/**/*.{ts,tsx}",
      "app/**/*.{ts,tsx}",
      "inngest/**/*.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
    ],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
      "boundaries/elements": [
        {
          type: "module-contracts",
          pattern: "src/modules/*/contracts/**/*",
          mode: "file",
          capture: ["module"],
        },
        {
          type: "module-root",
          pattern: "src/modules/*/*.module.ts",
          mode: "file",
          capture: ["module"],
        },
        {
          type: "module-internal",
          pattern: "src/modules/*/!(contracts)/**/*",
          mode: "file",
          capture: ["module"],
        },
        { type: "shared", pattern: "src/shared/**/*", mode: "file" },
        { type: "server", pattern: "src/server/**/*", mode: "file" },
        // Doc-7 presentation kit (src/frontend reserved for Doc-7 — REPOSITORY_STRUCTURE §Review).
        // Presentation-only: it may import other kit code + framework shared, NEVER a module
        // (no contract/data coupling — Doc-7B BR4/BR10). app/ composes it; tests render it.
        { type: "frontend", pattern: "src/frontend/**/*", mode: "file" },
        { type: "app", pattern: "app/**/*", mode: "file" },
        { type: "inngest", pattern: "inngest/**/*", mode: "file" },
        { type: "tests", pattern: "tests/**/*", mode: "file" },
      ],
    },
    rules: {
      "boundaries/no-unknown": "off",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          // A module may import its OWN internals/contracts + ANY module's contracts/ + shared.
          // It may NEVER import another module's domain/application/infrastructure/api.
          rules: [
            {
              from: ["module-internal", "module-root"],
              allow: [
                ["module-internal", { module: "${from.module}" }],
                ["module-root", { module: "${from.module}" }],
                ["module-contracts", { module: "${from.module}" }],
                "module-contracts",
                "shared",
              ],
            },
            // A module's PUBLIC contracts/ surface may delegate to its OWN module's private
            // implementation (application/domain/infrastructure) — the canonical DDD facade pattern
            // (contracts/ = the public face over the module's private internals). `${from.module}`
            // constrains this to the SAME module only: NO cross-module internal access is opened —
            // cross-module value-calls remain strictly contracts/→contracts/ (the One-Module rule is
            // intact). [WP-1.3 minimal boundaries refinement — Board-authorized; same-module only.]
            {
              from: ["module-contracts"],
              allow: [
                ["module-internal", { module: "${from.module}" }],
                ["module-root", { module: "${from.module}" }],
                "module-contracts",
                "shared",
              ],
            },
            { from: ["shared"], allow: ["shared"] },
            { from: ["server"], allow: ["server", "module-contracts", "shared"] },
            // The Doc-7 kit is presentation-only: kit + framework shared, NEVER a module
            // (no `contracts/` coupling — the kit receives content by props; Doc-7B BR4/BR10).
            { from: ["frontend"], allow: ["frontend", "shared"] },
            { from: ["app"], allow: ["app", "module-contracts", "server", "shared", "frontend"] },
            { from: ["inngest"], allow: ["inngest", "module-contracts", "server", "shared"] },
            // Tests may compose any module's contracts/ + shared + server, never internals
            // (§10: no cross-module import bypasses contracts/, including from test code). E2E/a11y
            // specs may ALSO import the `app` presentation layer they exercise (render a page/view for
            // an axe scan) — `app` is the composition/UI layer, NOT a module internal, so this opens NO
            // cross-module-internal access and the One-Module rule is untouched. [WP-1.6 test-infra:
            // tests→app for e2e/a11y rendering, mirrors the WP-1.3 same-module boundaries refinement.]
            {
              from: ["tests"],
              allow: ["tests", "module-contracts", "shared", "server", "app", "frontend"],
            },
          ],
        },
      ],
    },
  },
];

export default config;
