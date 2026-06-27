import type { Config } from "tailwindcss";

// Wave 0 bootstrap — Tailwind content scanning over the App Router + module UI.
// shadcn/ui theme tokens land with the frontend surfaces in later waves (Doc-7).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
