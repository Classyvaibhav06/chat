/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: "var(--color-parchment)",
        "warm-sand": "var(--color-warm-sand)",
        "linen-border": "var(--color-linen-border)",
        stone: "var(--color-stone)",
        "dim-gray": "var(--color-dim-gray)",
        charcoal: "var(--color-charcoal)",
        ink: "var(--color-ink)",
        "indigo-accent": "var(--color-indigo-accent)",
        
        // Map standard Tailwind colors for compatibility with components
        background: "var(--color-parchment)",
        foreground: "var(--color-charcoal)",
        border: "var(--color-linen-border)",
        input: "var(--color-linen-border)",
        ring: "var(--color-indigo-accent)",
        primary: {
          DEFAULT: "var(--color-charcoal)",
          foreground: "var(--color-parchment)",
        },
        secondary: {
          DEFAULT: "var(--color-warm-sand)",
          foreground: "var(--color-charcoal)",
        },
        muted: {
          DEFAULT: "var(--color-warm-sand)",
          foreground: "var(--color-dim-gray)",
        },
        card: {
          DEFAULT: "var(--color-warm-sand)",
          foreground: "var(--color-charcoal)",
        },
      },
      borderRadius: {
        lg: "var(--radius-2xl)", // 16px
        md: "var(--radius-xl)",  // 12px
        sm: "var(--radius-lg)",  // 8px
        pill: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-camera-plain-variable)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        "subtle-2": "var(--shadow-subtle-2)",
        "subtle-3": "var(--shadow-subtle-3)",
      },
    },
  },
  plugins: [],
}
