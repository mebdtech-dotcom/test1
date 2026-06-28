import type { Config } from "tailwindcss";

/*
 * iVendorz Design System — Tailwind theme (Wave 0 Foundation).
 * All color values are sourced from CSS variables defined in app/globals.css
 * so the system supports light/dark and future white-labeling without code edits.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    // Responsive breakpoints (desktop-first design, mobile-up utilities).
    screens: {
      sm: "640px", // Mobile landscape
      md: "768px", // Tablet
      lg: "1024px", // Laptop
      xl: "1280px", // Desktop
      "2xl": "1536px", // Wide desktop
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1360px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          subtle: "hsl(var(--success-subtle))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          subtle: "hsl(var(--warning-subtle))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          subtle: "hsl(var(--info-subtle))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Type scale — label/caption/body/heading. [size, { lineHeight, letterSpacing }]
        caption: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        label: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0.005em" }],
        sm: ["0.875rem", { lineHeight: "1.5rem" }],
        base: ["1rem", { lineHeight: "1.625rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        "heading-sm": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "heading-md": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em" }],
        "heading-lg": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
        "heading-xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.022em" }],
        display: ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.025em" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 hsl(215 28% 17% / 0.05)",
        sm: "0 1px 3px 0 hsl(215 28% 17% / 0.08), 0 1px 2px -1px hsl(215 28% 17% / 0.06)",
        md: "0 4px 8px -2px hsl(215 28% 17% / 0.10), 0 2px 4px -2px hsl(215 28% 17% / 0.06)",
        lg: "0 12px 20px -4px hsl(215 28% 17% / 0.12), 0 4px 8px -4px hsl(215 28% 17% / 0.08)",
        xl: "0 24px 40px -8px hsl(215 28% 17% / 0.16), 0 8px 16px -8px hsl(215 28% 17% / 0.08)",
        focus: "0 0 0 3px hsl(var(--ring) / 0.35)",
      },
      spacing: {
        // Extended scale on top of the default 4px grid.
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "112": "28rem",
        "128": "32rem",
        sidebar: "16rem",
        "sidebar-collapsed": "4rem",
        header: "4rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
