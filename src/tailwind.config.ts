import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        pontedra: { // Adicionando cores personalizadas
          green: "#00C896",
          'green-light': "#00E0A0", // Nova cor
          'green-hover': "#4acb78", // Nova cor
          'dark-text': "#081017", // Nova cor
          'border-light': "#2a3b4b", // Nova cor
          dark: "#0D1B2A", // Cor de fundo para a seção Quem Somos
          'shader-bg': '#0a0f1c', // Cor de fundo para o shader
          'neon-green': '#00ffae', // Cor de linha 1 (para gradiente de texto)
          'neon-blue': '#00b4ff', // Cor de linha 2
          // Novas cores para o Hero
          'hero-bg-dark': '#0B1420',
          'line-green-dark': '#1C2C20',
          'line-green-light': '#2C3E30',
          'title-green': '#A8E063',
          'subtitle-gray': '#C0C6CA',
          'button-green': '#7ED957',
          'button-green-hover': '#6CC94A',
          'checklist-card-bg': '#101B25',
        },
        // Mapeando as novas cores genéricas para as variáveis CSS existentes
        textPrimary: "hsl(var(--foreground))",
        textSecondary: "hsl(var(--muted-foreground))",
        bgMain: "hsl(var(--background))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem", // Adicionado para rounded-2xl
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "border-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "icon-glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(87, 227, 137, 0.6), 0 0 15px rgba(87, 227, 137, 0.3)" },
          "50%": { boxShadow: "0 0 12px rgba(87, 227, 137, 0.8), 0 0 20px rgba(87, 227, 137, 0.5)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.3)", opacity: "0.8" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "text-glow-pulse": {
          "0%, 100%": { textShadow: "0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary)), 0 0 15px hsl(var(--primary)/0.5)" },
          "50%": { textShadow: "0 0 8px hsl(var(--primary)), 0 0 15px hsl(var(--primary)), 0 0 25px hsl(var(--primary)/0.7)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-spin": "border-spin 4s linear infinite",
        "icon-glow-pulse": "icon-glow-pulse 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "icon-rotate": "spin 20s linear infinite", // Using existing spin keyframe
        "text-glow": "text-glow-pulse 4s ease-in-out infinite",
      },
      backgroundImage: {
        'noise-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2357e389' fill-opacity='0.05'%3E%3Ccircle cx='10' cy='10' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;