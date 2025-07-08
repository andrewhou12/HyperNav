import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./session.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          hover: 'hsl(var(--card-hover))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        dashboard: {
          'session-item': 'hsl(var(--session-item))',
          'app-icon': 'hsl(var(--app-icon-bg))',
          'stack': 'hsl(var(--stack-bg))',
          'stack-hover': 'hsl(var(--stack-hover))',
          'overlay': 'hsl(var(--overlay-bg))',
          'glass': 'hsl(var(--glass-bg))'
        },
        cortex: {
          primary: 'hsl(var(--cortex-primary))',
          'primary-light': 'hsl(var(--cortex-primary-light))',
          surface: 'hsl(var(--cortex-surface))',
          'surface-secondary': 'hsl(var(--cortex-surface-secondary))',
          text: 'hsl(var(--cortex-text))',
          'text-muted': 'hsl(var(--cortex-text-muted))'
        }
      },
      boxShadow: {
        'dashboard': 'var(--dashboard-shadow)',
        'dashboard-hover': 'var(--dashboard-shadow-hover)',
        'dashboard-lg': 'var(--dashboard-shadow-lg)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95) translateY(8px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          }
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(51, 153, 255, 0.1)'
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(51, 153, 255, 0.2)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.15s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
