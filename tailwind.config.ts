import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * iVendorz Tailwind Configuration
 * Design System: "Industrial Precision, Human Clarity"
 *
 * Extends Tailwind with iVendorz design tokens so all --iv-* CSS custom properties
 * can be used as Tailwind classes (e.g. bg-iv-surface-raised, text-iv-brand-400).
 *
 * Wave 0 bootstrap note: shadcn/ui theme tokens land with frontend surfaces
 * in later waves (Doc-7). This config is the foundation.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      /* -----------------------------------------------------------------------
         COLORS — mirrors --iv-* CSS custom properties
      ----------------------------------------------------------------------- */
      colors: {
        /* shadcn/ui semantic color keys — each maps to a CSS var defined in
           globals.css (the iv semantic-token layer). These let the vendored
           kit primitives use bg-background / text-foreground / border-border /
           bg-primary etc. while theming THROUGH the iv tokens (light + dark). */
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        // Semantic typography ink — navy headings/labels/links + slate body/secondary/muted.
        "iv-ink": {
          DEFAULT: "var(--iv-fg)",
          strong: "var(--iv-fg-strong)",
          secondary: "var(--iv-fg-secondary)",
          muted: "var(--iv-fg-muted)",
          heading: "var(--iv-fg-heading)",
          "heading-strong": "var(--iv-fg-heading-strong)",
        },
        "iv-brand": {
          50: "var(--iv-brand-50)",
          100: "var(--iv-brand-100)",
          200: "var(--iv-brand-200)",
          300: "var(--iv-brand-300)",
          400: "var(--iv-brand-400)",
          500: "var(--iv-brand-500)",
          600: "var(--iv-brand-600)",
          700: "var(--iv-brand-700)",
          800: "var(--iv-brand-800)",
          900: "var(--iv-brand-900)",
          950: "var(--iv-brand-950)",
        },
        "iv-navy": {
          50: "var(--iv-navy-50)",
          100: "var(--iv-navy-100)",
          200: "var(--iv-navy-200)",
          300: "var(--iv-navy-300)",
          400: "var(--iv-navy-400)",
          500: "var(--iv-navy-500)",
          600: "var(--iv-navy-600)",
          700: "var(--iv-navy-700)",
          800: "var(--iv-navy-800)",
          900: "var(--iv-navy-900)",
          950: "var(--iv-navy-950)",
        },
        "iv-nav": {
          bg: "var(--iv-nav-bg)",
          fg: "var(--iv-nav-fg)",
          "fg-muted": "var(--iv-nav-fg-muted)",
          border: "var(--iv-nav-border)",
          hover: "var(--iv-nav-hover-bg)",
          "selected-bg": "var(--iv-nav-selected-bg)",
          "selected-fg": "var(--iv-nav-selected-fg)",
          "badge-bg": "var(--iv-nav-badge-bg)",
          "badge-fg": "var(--iv-nav-badge-fg)",
        },
        "iv-chart": {
          1: "var(--iv-chart-1)",
          2: "var(--iv-chart-2)",
          3: "var(--iv-chart-3)",
          4: "var(--iv-chart-4)",
          5: "var(--iv-chart-5)",
          6: "var(--iv-chart-6)",
        },
        "iv-amber": {
          50: "var(--iv-amber-50)",
          100: "var(--iv-amber-100)",
          200: "var(--iv-amber-200)",
          300: "var(--iv-amber-300)",
          400: "var(--iv-amber-400)",
          500: "var(--iv-amber-500)",
          600: "var(--iv-amber-600)",
          700: "var(--iv-amber-700)",
          800: "var(--iv-amber-800)",
          900: "var(--iv-amber-900)",
        },
        // Surfaces
        "iv-surface": {
          base: "var(--iv-surface-base)",
          raised: "var(--iv-surface-raised)",
          overlay: "var(--iv-surface-overlay)",
          muted: "var(--iv-surface-muted)",
          border: "var(--iv-surface-border)",
          hover: "var(--iv-surface-hover)",
          selected: "var(--iv-surface-selected)",
        },
        "iv-light": {
          base: "var(--iv-light-base)",
          raised: "var(--iv-light-raised)",
          overlay: "var(--iv-light-overlay)",
          muted: "var(--iv-light-muted)",
          border: "var(--iv-light-border)",
          hover: "var(--iv-light-hover)",
        },
        // Semantic
        "iv-success": {
          subtle: "var(--iv-success-subtle)",
          muted: "var(--iv-success-muted)",
          base: "var(--iv-success-base)",
          bright: "var(--iv-success-bright)",
          text: "var(--iv-success-text)",
        },
        "iv-warning": {
          subtle: "var(--iv-warning-subtle)",
          muted: "var(--iv-warning-muted)",
          base: "var(--iv-warning-base)",
          bright: "var(--iv-warning-bright)",
          text: "var(--iv-warning-text)",
        },
        "iv-danger": {
          subtle: "var(--iv-danger-subtle)",
          muted: "var(--iv-danger-muted)",
          base: "var(--iv-danger-base)",
          bright: "var(--iv-danger-bright)",
          text: "var(--iv-danger-text)",
        },
        "iv-info": {
          subtle: "var(--iv-info-subtle)",
          muted: "var(--iv-info-muted)",
          base: "var(--iv-info-base)",
          bright: "var(--iv-info-bright)",
          text: "var(--iv-info-text)",
        },
        "iv-neutral": {
          subtle: "var(--iv-neutral-subtle)",
          muted: "var(--iv-neutral-muted)",
          base: "var(--iv-neutral-base)",
          bright: "var(--iv-neutral-bright)",
          text: "var(--iv-neutral-text)",
        },
        // Domain
        "iv-trust": {
          low: "var(--iv-trust-low)",
          medium: "var(--iv-trust-medium)",
          high: "var(--iv-trust-high)",
          elite: "var(--iv-trust-elite)",
        },
        "iv-tier": {
          a: "var(--iv-tier-a)",
          b: "var(--iv-tier-b)",
          c: "var(--iv-tier-c)",
          d: "var(--iv-tier-d)",
          e: "var(--iv-tier-e)",
        },
        "iv-cap": {
          supply: "var(--iv-cap-supply)",
          service: "var(--iv-cap-service)",
          fabricate: "var(--iv-cap-fabricate)",
          consult: "var(--iv-cap-consult)",
        },
      },

      /* -----------------------------------------------------------------------
         BACKGROUND IMAGES — brand gradients (color migration 2026-06-30)
      ----------------------------------------------------------------------- */
      backgroundImage: {
        "iv-primary": "var(--iv-gradient-primary)",
      },

      /* -----------------------------------------------------------------------
         FONTS
      ----------------------------------------------------------------------- */
      fontFamily: {
        sans: ["var(--iv-font-sans)"],
        mono: ["var(--iv-font-mono)"],
      },

      /* -----------------------------------------------------------------------
         FONT SIZE — with leading/tracking defaults per scale step
      ----------------------------------------------------------------------- */
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "5xl": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
      },

      /* -----------------------------------------------------------------------
         BORDER RADIUS
      ----------------------------------------------------------------------- */
      borderRadius: {
        sm: "var(--iv-radius-sm)",
        md: "var(--iv-radius-md)",
        lg: "var(--iv-radius-lg)",
        xl: "var(--iv-radius-xl)",
        "2xl": "var(--iv-radius-2xl)",
        full: "var(--iv-radius-full)",
      },

      /* -----------------------------------------------------------------------
         BOX SHADOW
      ----------------------------------------------------------------------- */
      boxShadow: {
        "iv-xs": "var(--iv-shadow-xs)",
        "iv-sm": "var(--iv-shadow-sm)",
        "iv-md": "var(--iv-shadow-md)",
        "iv-lg": "var(--iv-shadow-lg)",
        "iv-xl": "var(--iv-shadow-xl)",
        "iv-2xl": "var(--iv-shadow-2xl)",
        "iv-brand": "var(--iv-glow-brand)",
        "iv-success": "var(--iv-glow-success)",
        "iv-amber": "var(--iv-glow-amber)",
      },

      /* -----------------------------------------------------------------------
         TRANSITION TIMING
      ----------------------------------------------------------------------- */
      transitionDuration: {
        instant: "50ms",
        fast: "100ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
        slowest: "800ms",
      },
      transitionTimingFunction: {
        "iv-out": "cubic-bezier(0, 0, 0.2, 1)",
        "iv-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "iv-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "iv-decelerate": "cubic-bezier(0, 0, 0.2, 1)",
      },

      /* -----------------------------------------------------------------------
         SPACING — extra granular steps that Tailwind default doesn't have
      ----------------------------------------------------------------------- */
      spacing: {
        "4.5": "18px",
        "5.5": "22px",
        "13": "52px",
        "15": "60px",
        "18": "72px",
        "22": "88px",
        "26": "104px",
        "30": "120px",
      },

      /* -----------------------------------------------------------------------
         ANIMATION
      ----------------------------------------------------------------------- */
      keyframes: {
        "iv-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "iv-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "iv-slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "iv-slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "iv-scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "iv-pulse-brand": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(99, 102, 241, 0)" },
        },
        "iv-accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "iv-accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "iv-shimmer": "iv-shimmer 1.5s ease-in-out infinite",
        "iv-fade-in": "iv-fade-in 200ms ease-out forwards",
        "iv-slide-up": "iv-slide-up 250ms cubic-bezier(0,0,0.2,1) forwards",
        "iv-slide-down": "iv-slide-down 250ms cubic-bezier(0,0,0.2,1) forwards",
        "iv-scale-in": "iv-scale-in 200ms cubic-bezier(0,0,0.2,1) forwards",
        "iv-pulse-brand": "iv-pulse-brand 2s ease-in-out infinite",
        "iv-accordion-down": "iv-accordion-down 200ms cubic-bezier(0,0,0.2,1)",
        "iv-accordion-up": "iv-accordion-up 200ms cubic-bezier(0,0,0.2,1)",
      },

      /* -----------------------------------------------------------------------
         SCREENS — matches --iv-bp-* tokens
      ----------------------------------------------------------------------- */
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
