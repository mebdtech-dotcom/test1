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
            { from: ["module-contracts"], allow: ["module-contracts", "shared"] },
            { from: ["shared"], allow: ["shared"] },
            { from: ["server"], allow: ["server", "module-contracts", "shared"] },
            { from: ["app"], allow: ["app", "module-contracts", "server", "shared"] },
            { from: ["inngest"], allow: ["inngest", "module-contracts", "server", "shared"] },
            // Tests may compose any module's contracts/ + shared + server, never internals
            // (§10: no cross-module import bypasses contracts/, including from test code).
            { from: ["tests"], allow: ["tests", "module-contracts", "shared", "server"] },
          ],
        },
      ],
    },
  },
];

export default config;
