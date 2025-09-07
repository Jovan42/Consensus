/**
 * Centralized color configuration for the Consensus application
 * 
 * This file contains all color definitions used throughout the UI,
 * organized by semantic meaning and usage context.
 */

// Base color palette
export const baseColors = {
  // Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Blues (Primary brand colors)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Primary blue
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Reds (Error/destructive actions)
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // Primary red
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Greens (Success states)
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a', // Primary green
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Yellows (Warning states)
  yellow: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706', // Primary yellow
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Purples (Accent colors)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea', // Primary purple
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
} as const;

// Semantic color tokens
export const semanticColors = {
  // Background colors
  background: {
    primary: 'hsl(var(--background))',
    page: 'hsl(var(--page-background))',
    content: 'hsl(var(--content-background))',
    card: 'hsl(var(--card))',
    muted: 'hsl(var(--muted))',
    accent: 'hsl(var(--accent))',
  },
  
  // Text colors
  text: {
    primary: 'hsl(var(--foreground))',
    secondary: 'hsl(var(--muted-foreground))',
    accent: 'hsl(var(--accent-foreground))',
    inverse: 'hsl(var(--primary-foreground))',
  },
  
  // Interactive colors
  interactive: {
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
      hover: baseColors.blue[700],
      active: baseColors.blue[800],
    },
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
      hover: baseColors.gray[200],
      active: baseColors.gray[300],
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
      hover: baseColors.red[700],
      active: baseColors.red[800],
    },
  },
  
  // Border colors
  border: {
    DEFAULT: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    focus: 'hsl(var(--ring))',
  },
  
  // Status colors (using semantic colors that adapt to theme)
  status: {
    success: {
      background: 'hsl(var(--success))',
      border: 'hsl(var(--success))',
      text: 'hsl(var(--success))',
      icon: 'hsl(var(--success))',
    },
    error: {
      background: 'hsl(var(--destructive))',
      border: 'hsl(var(--destructive))',
      text: 'hsl(var(--destructive))',
      icon: 'hsl(var(--destructive))',
    },
    warning: {
      background: 'hsl(var(--warning))',
      border: 'hsl(var(--warning))',
      text: 'hsl(var(--warning))',
      icon: 'hsl(var(--warning))',
    },
    info: {
      background: 'hsl(var(--primary))',
      border: 'hsl(var(--primary))',
      text: 'hsl(var(--primary))',
      icon: 'hsl(var(--primary))',
    },
  },
  
  // Role-based colors (using semantic colors that adapt to theme)
  roles: {
    admin: {
      background: 'hsl(var(--destructive))',
      text: 'hsl(var(--destructive))',
      icon: 'hsl(var(--destructive))',
    },
    manager: {
      background: 'hsl(var(--primary))',
      text: 'hsl(var(--primary))',
      icon: 'hsl(var(--primary))',
    },
    member: {
      background: 'hsl(var(--muted))',
      text: 'hsl(var(--foreground))',
      icon: 'hsl(var(--muted-foreground))',
    },
    test: {
      background: 'hsl(var(--warning))',
      text: 'hsl(var(--warning))',
      icon: 'hsl(var(--warning))',
    },
  },
  
  // Chart colors
  chart: {
    1: 'hsl(var(--chart-1))',
    2: 'hsl(var(--chart-2))',
    3: 'hsl(var(--chart-3))',
    4: 'hsl(var(--chart-4))',
    5: 'hsl(var(--chart-5))',
  },
} as const;

// Component-specific color variants
export const componentColors = {
  button: {
    primary: {
      background: baseColors.blue[600],
      text: baseColors.gray[50],
      hover: baseColors.blue[700],
      active: baseColors.blue[800],
    },
    secondary: {
      background: baseColors.gray[100],
      text: baseColors.gray[900],
      hover: baseColors.gray[200],
      active: baseColors.gray[300],
    },
    outline: {
      background: 'transparent',
      text: baseColors.gray[700],
      border: baseColors.gray[300],
      hover: baseColors.gray[50],
      active: baseColors.gray[100],
    },
    ghost: {
      background: 'transparent',
      text: baseColors.gray[700],
      hover: baseColors.gray[100],
      active: baseColors.gray[200],
    },
    destructive: {
      background: baseColors.red[600],
      text: baseColors.gray[50],
      hover: baseColors.red[700],
      active: baseColors.red[800],
    },
  },
  
  input: {
    background: 'hsl(var(--background))',
    border: baseColors.gray[300],
    text: 'hsl(var(--foreground))',
    placeholder: baseColors.gray[400],
    focus: {
      border: baseColors.blue[500],
      ring: baseColors.blue[500],
    },
    error: {
      border: baseColors.red[300],
      ring: baseColors.red[500],
    },
    disabled: {
      background: baseColors.gray[50],
      text: baseColors.gray[500],
    },
  },
  
  card: {
    background: 'hsl(var(--card))',
    border: baseColors.gray[200],
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  
  navigation: {
    background: baseColors.gray[50],
    border: baseColors.gray[200],
    text: baseColors.gray[600],
    hover: baseColors.gray[900],
    brand: baseColors.blue[600],
  },
  
  scrollbar: {
    track: '#f1f1f1',
    thumb: '#c1c1c1',
    thumbHover: '#a8a8a8',
  },
} as const;

// Dark mode overrides
export const darkModeColors = {
  scrollbar: {
    track: baseColors.gray[800],
    thumb: baseColors.gray[600],
    thumbHover: baseColors.gray[500],
  },
  
  page: {
    buttonPrimaryHover: '#ccc',
    buttonSecondaryHover: '#1a1a1a',
    grayAlpha200: 'rgba(255, 255, 255, 0.145)',
    grayAlpha100: 'rgba(255, 255, 255, 0.06)',
  },
} as const;

// Utility function to get color values
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let current: any = { ...baseColors, ...semanticColors, ...componentColors };
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Color path "${path}" not found`);
      return '#000000';
    }
  }
  
  return typeof current === 'string' ? current : '#000000';
};

// Type definitions for better TypeScript support
export type BaseColorKey = keyof typeof baseColors;
export type SemanticColorKey = keyof typeof semanticColors;
export type ComponentColorKey = keyof typeof componentColors;
export type ColorPath = `${BaseColorKey}.${string}` | `${SemanticColorKey}.${string}` | `${ComponentColorKey}.${string}`;
