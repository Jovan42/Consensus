import { baseColors, semanticColors, componentColors } from './lib/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base color palette
        ...baseColors,
        
        // Semantic colors (using CSS variables for theme support)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Status colors
        success: {
          DEFAULT: baseColors.green[600],
          50: baseColors.green[50],
          100: baseColors.green[100],
          200: baseColors.green[200],
          600: baseColors.green[600],
          700: baseColors.green[700],
          800: baseColors.green[800],
        },
        error: {
          DEFAULT: baseColors.red[600],
          50: baseColors.red[50],
          100: baseColors.red[100],
          200: baseColors.red[200],
          300: baseColors.red[300],
          500: baseColors.red[500],
          600: baseColors.red[600],
          700: baseColors.red[700],
          800: baseColors.red[800],
        },
        warning: {
          DEFAULT: baseColors.yellow[600],
          50: baseColors.yellow[50],
          100: baseColors.yellow[100],
          200: baseColors.yellow[200],
          600: baseColors.yellow[600],
          700: baseColors.yellow[700],
          800: baseColors.yellow[800],
        },
        info: {
          DEFAULT: baseColors.blue[600],
          50: baseColors.blue[50],
          100: baseColors.blue[100],
          200: baseColors.blue[200],
          600: baseColors.blue[600],
          700: baseColors.blue[700],
          800: baseColors.blue[800],
        },
        
        // Chart colors
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
