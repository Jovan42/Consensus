# Theme System Documentation

This document describes the comprehensive theme system implemented in the Consensus application, including dark mode support, theme switching, and the centralized color system.

## 🌟 Overview

The theme system provides:
- **🌙 Dark Mode**: Complete dark theme implementation
- **🔄 Theme Switching**: Easy switching between light, dark, and system themes
- **🎨 Centralized Colors**: All colors defined in one place with semantic meaning
- **📱 Responsive**: Themes work across all devices and screen sizes
- **♿ Accessible**: Colors meet WCAG contrast requirements
- **⚡ Performance**: Optimized with SSR support and FOUC prevention

## 🏗️ Architecture

### Core Components

```
app/
├── contexts/
│   └── ThemeContext.tsx      # Theme state management
├── components/
│   ├── ThemeToggle.tsx       # Theme switching UI
│   └── ThemeScript.tsx       # SSR theme application
├── lib/
│   ├── colors.ts            # Color definitions
│   └── color-utils.ts       # Color utility functions
└── theme-demo/
    └── page.tsx             # Theme demonstration page
```

### CSS Structure

```
app/
├── globals.css              # Global styles and CSS variables
└── tailwind.config.js       # Tailwind configuration with custom colors
```

## 🎨 Color System

### Three-Tier Color Hierarchy

The dark theme uses a sophisticated three-tier color system:

```css
/* Dark Theme Colors */
--page-background: 222.2 84% 8%;    /* Outer page background (darkest) */
--background: 222.2 84% 12%;        /* Main content area (medium) */
--card: 222.2 84% 12%;              /* Cards and navigation (same as content) */
```

**Visual Hierarchy:**
1. **Page Background** (8% lightness): Darkest - outer page areas
2. **Main Content** (12% lightness): Medium - main content areas  
3. **Cards/Navigation** (12% lightness): Same as main content - unified appearance

### Light Theme

```css
/* Light Theme Colors */
--page-background: 210 40% 98%;     /* Slightly different outer background */
--background: 0 0% 100%;            /* Pure white main content */
--card: 0 0% 100%;                  /* White cards */
```

## 🔧 Implementation Details

### ThemeContext

The `ThemeContext` provides theme state management across the application:

```tsx
interface ThemeContextType {
  theme: Theme;                    // 'light' | 'dark' | 'system'
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark'; // Actual theme being used
}
```

**Features:**
- **System Theme Detection**: Automatically detects user's system preference
- **Local Storage Persistence**: Remembers user's theme choice
- **Hydration Safety**: Prevents hydration mismatches with `mounted` state
- **Real-time Updates**: Listens for system theme changes

### ThemeToggle Component

Two variants available:

1. **Full ThemeToggle**: Three-button toggle (light/dark/system)
2. **SimpleThemeToggle**: Single button toggle (light/dark)

**Features:**
- **Hydration Safe**: Shows placeholder until mounted
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Visual Feedback**: Clear indication of current theme

### ThemeScript

Prevents Flash of Unstyled Content (FOUC) by applying the theme before React hydration:

```tsx
// Runs immediately in <head>
const codeToRunOnClient = `
  (function() {
    const themePreference = getThemePreference();
    const colorScheme = themePreference === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themePreference;
    
    document.documentElement.className = colorScheme;
  })()
`;
```

## 🚀 Usage Guide

### Basic Theme Usage

```tsx
import { useTheme } from '@/app/contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <div className="bg-background text-foreground">
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

### Color System Usage

```tsx
// Use semantic Tailwind classes (recommended)
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
<Alert variant="success">Success message</Alert>

// Use utility functions for dynamic colors
import { getRoleColors } from '@/lib/color-utils';
const colors = getRoleColors('admin');
```

### Adding Theme Support to Components

```tsx
// ✅ Good - uses semantic colors
function MyComponent() {
  return (
    <div className="bg-background text-foreground border-border">
      <h1 className="text-foreground">Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
  );
}

// ❌ Avoid - hardcoded colors
function MyComponent() {
  return (
    <div className="bg-white text-black border-gray-300">
      <h1 className="text-black">Title</h1>
      <p className="text-gray-600">Description</p>
    </div>
  );
}
```

## 🎯 Theme Demo Page

The `/theme-demo` page (admin only) showcases all theme features:

- **Theme Controls**: Interactive theme switching
- **Color System Showcase**: All color variations
- **Button Variants**: All button styles
- **Alert Variants**: All alert types
- **Real-time Updates**: See changes immediately

## 🔒 Access Control

- **Theme Demo**: Admin only (`hasRole('admin')`)
- **Theme Toggle**: Available to all authenticated users
- **Theme Context**: Available throughout the application

## 🐛 Troubleshooting

### Common Issues

1. **Hydration Mismatch Error**
   - **Cause**: Server and client render different HTML
   - **Solution**: Use `mounted` state in components that depend on theme

2. **Flash of Unstyled Content (FOUC)**
   - **Cause**: Theme not applied before React hydration
   - **Solution**: ThemeScript runs in `<head>` to apply theme immediately

3. **Theme Not Persisting**
   - **Cause**: Local storage not working or theme not saved
   - **Solution**: Check browser console for errors, verify localStorage access

4. **Colors Not Updating**
   - **Cause**: Using hardcoded colors instead of semantic ones
   - **Solution**: Replace hardcoded colors with semantic Tailwind classes

### Debugging

```tsx
// Debug theme state
import { useTheme } from '@/app/contexts/ThemeContext';

function DebugTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  console.log('Theme:', theme);
  console.log('Resolved Theme:', resolvedTheme);
  console.log('System Preference:', window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return <div>Debug info in console</div>;
}
```

## 📱 Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **CSS Custom Properties**: Required for theme variables
- **Local Storage**: Required for theme persistence
- **Media Queries**: Required for system theme detection

## 🔮 Future Enhancements

- **Custom Themes**: User-defined color schemes
- **Theme Presets**: Predefined theme variations
- **Animation Transitions**: Smooth theme switching animations
- **High Contrast Mode**: Accessibility enhancement
- **Theme Scheduling**: Automatic theme switching based on time

## 📚 Related Documentation

- [Color System Documentation](../apps/consensus-web/docs/COLOR-SYSTEM.md)
- [Color Migration Status](../apps/consensus-web/docs/COLOR-MIGRATION-STATUS.md)
- [Development Guide](./DEVELOPMENT-GUIDE.md)

## 🤝 Contributing

When working with themes:

1. **Always use semantic colors** instead of hardcoded values
2. **Test both light and dark themes** for all changes
3. **Ensure proper contrast ratios** for accessibility
4. **Update documentation** when adding new theme features
5. **Test theme switching** to ensure smooth transitions

For more details, see the [Color System Documentation](../apps/consensus-web/docs/COLOR-SYSTEM.md).
