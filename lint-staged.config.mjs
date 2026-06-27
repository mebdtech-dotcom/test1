// lint-staged — runs on staged files via the Husky pre-commit hook.
// Lint (auto-fix) then format; prettier has the final say on style. Docs (*.md) and
// generated/local paths are excluded via .prettierignore (so they no-op if staged).
const config = {
  "*.{ts,tsx,mjs,cjs,js}": ["eslint --fix", "prettier --write"],
  "*.{json,css,yml,yaml}": ["prettier --write"],
};

export default config;
