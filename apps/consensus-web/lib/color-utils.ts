/**
 * Color utility functions for the Consensus application
 * 
 * This file provides helper functions for working with colors
 * and ensuring consistent color usage across components.
 */

import { getColor, semanticColors, componentColors, baseColors } from './colors';

/**
 * Get role-based colors for user roles
 */
export const getRoleColors = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return {
        background: semanticColors.roles.admin.background,
        text: semanticColors.roles.admin.text,
        icon: semanticColors.roles.admin.icon,
      };
    case 'manager':
      return {
        background: semanticColors.roles.manager.background,
        text: semanticColors.roles.manager.text,
        icon: semanticColors.roles.manager.icon,
      };
    case 'member':
      return {
        background: semanticColors.roles.member.background,
        text: semanticColors.roles.member.text,
        icon: semanticColors.roles.member.icon,
      };
    case 'test':
      return {
        background: semanticColors.roles.test.background,
        text: semanticColors.roles.test.text,
        icon: semanticColors.roles.test.icon,
      };
    default:
      return {
        background: semanticColors.roles.member.background,
        text: semanticColors.roles.member.text,
        icon: semanticColors.roles.member.icon,
      };
  }
};

/**
 * Get status colors for alerts and notifications
 */
export const getStatusColors = (status: 'success' | 'error' | 'warning' | 'info') => {
  return semanticColors.status[status];
};

/**
 * Get button variant colors
 */
export const getButtonColors = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive') => {
  return componentColors.button[variant];
};

/**
 * Get input state colors
 */
export const getInputColors = (state: 'default' | 'focus' | 'error' | 'disabled' = 'default') => {
  switch (state) {
    case 'focus':
      return {
        border: componentColors.input.focus.border,
        ring: componentColors.input.focus.ring,
      };
    case 'error':
      return {
        border: componentColors.input.error.border,
        ring: componentColors.input.error.ring,
      };
    case 'disabled':
      return {
        background: componentColors.input.disabled.background,
        text: componentColors.input.disabled.text,
      };
    default:
      return {
        background: componentColors.input.background,
        border: componentColors.input.border,
        text: componentColors.input.text,
        placeholder: componentColors.input.placeholder,
      };
  }
};

/**
 * Generate CSS custom properties for a color palette
 */
export const generateColorCSS = (colorMap: Record<string, string>) => {
  return Object.entries(colorMap)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n');
};

/**
 * Convert hex color to HSL values
 */
export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Convert HSL values to CSS HSL string
 */
export const hslToCSS = (h: number, s: number, l: number): string => {
  return `${h} ${s}% ${l}%`;
};

/**
 * Get contrast color (black or white) for a given background color
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in a real app you might want to use a more sophisticated algorithm
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

/**
 * Generate a color palette with different shades
 */
export const generateColorPalette = (baseColor: string, name: string) => {
  const hsl = hexToHsl(baseColor);
  const palette: Record<string, string> = {};
  
  // Generate 50-900 scale
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const lightnessValues = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];
  
  shades.forEach((shade, index) => {
    const lightness = lightnessValues[index];
    palette[shade] = `hsl(${hsl.h} ${hsl.s}% ${lightness}%)`;
  });
  
  return palette;
};

/**
 * Color accessibility utilities
 */
export const colorUtils = {
  /**
   * Check if two colors have sufficient contrast ratio
   */
  getContrastRatio: (color1: string, color2: string): number => {
    // Simplified contrast ratio calculation
    // In production, use a proper contrast ratio library
    const getLuminance = (color: string) => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      ) as [number, number, number];
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },
  
  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (foreground: string, background: string): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard for normal text
  },
  
  /**
   * Check if color combination meets WCAG AAA standards
   */
  meetsWCAGAAA: (foreground: string, background: string): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);
    return ratio >= 7; // WCAG AAA standard for normal text
  },
};
