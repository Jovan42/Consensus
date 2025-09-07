# Color System Documentation

This document describes the centralized color system used throughout the Consensus application.

## Overview

The color system is designed to provide:
- **Consistency**: All colors are defined in one place
- **Semantic meaning**: Colors have meaningful names that describe their purpose
- **Theme support**: Light and dark mode support through CSS variables
- **Accessibility**: Colors are chosen to meet WCAG contrast requirements
- **Maintainability**: Easy to update colors across the entire application

## File Structure

```
lib/
├── colors.ts          # Main color definitions
├── color-utils.ts     # Utility functions for working with colors
└── utils.ts          # General utilities (includes cn function)

docs/
└── COLOR-SYSTEM.md   # This documentation file
```

## Color Categories

### 1. Base Colors (`baseColors`)

The foundation color palette with standard color scales:

```typescript
import { baseColors } from '@/lib/colors';

// Usage examples
baseColors.blue[600]    // Primary blue
baseColors.gray[100]    // Light gray
baseColors.red[500]     // Error red
```

**Available color families:**
- `gray` - Neutral grays (50-900)
- `blue` - Primary brand colors (50-900)
- `red` - Error/destructive actions (50-900)
- `green` - Success states (50-900)
- `yellow` - Warning states (50-900)
- `purple` - Accent colors (50-900)

### 2. Semantic Colors (`semanticColors`)

Colors with semantic meaning that adapt to themes:

```typescript
import { semanticColors } from '@/lib/colors';

// Background colors
semanticColors.background.primary    // Main background
semanticColors.background.secondary  // Card backgrounds
semanticColors.background.muted      // Muted backgrounds

// Text colors
semanticColors.text.primary          // Main text
semanticColors.text.secondary        // Secondary text
semanticColors.text.inverse          // Text on colored backgrounds

// Interactive colors
semanticColors.interactive.primary   // Primary buttons/links
semanticColors.interactive.secondary // Secondary buttons/links
semanticColors.interactive.destructive // Destructive actions
```

### 3. Component Colors (`componentColors`)

Specific color configurations for UI components:

```typescript
import { componentColors } from '@/lib/colors';

// Button variants
componentColors.button.primary
componentColors.button.secondary
componentColors.button.outline
componentColors.button.ghost
componentColors.button.destructive

// Input states
componentColors.input.background
componentColors.input.border
componentColors.input.focus
componentColors.input.error
componentColors.input.disabled
```

## Usage in Components

### Tailwind Classes

The color system is integrated with Tailwind CSS. Use semantic class names:

```tsx
// ✅ Good - uses semantic colors
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
<div className="border-border bg-card">

// ❌ Avoid - hardcoded colors
<div className="bg-white text-black">
<button className="bg-blue-600 text-white">
```

### Direct Color Access

For cases where you need direct color values:

```tsx
import { getColor } from '@/lib/colors';

const primaryColor = getColor('blue.600');
const semanticColor = getColor('interactive.primary.DEFAULT');
```

### Utility Functions

Use the provided utility functions for common patterns:

```tsx
import { getRoleColors, getStatusColors } from '@/lib/color-utils';

// Role-based colors
const adminColors = getRoleColors('admin');
const memberColors = getRoleColors('member');

// Status colors
const successColors = getStatusColors('success');
const errorColors = getStatusColors('error');
```

## Theme Support

### CSS Variables

The system uses CSS variables for theme support:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

### Using in CSS

```css
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
```

## Status Colors

The system includes predefined status colors for alerts and notifications:

```tsx
// Alert component usage
<Alert variant="success">Success message</Alert>
<Alert variant="error">Error message</Alert>
<Alert variant="warning">Warning message</Alert>
<Alert variant="info">Info message</Alert>
```

**Status color mappings:**
- `success` → Green palette
- `error` → Red palette  
- `warning` → Yellow palette
- `info` → Blue palette

## Role-Based Colors

User roles have associated color schemes:

```tsx
import { getRoleColors } from '@/lib/color-utils';

const roleColors = getRoleColors(user.role);

<div 
  className="px-2 py-1 rounded-full"
  style={{
    backgroundColor: roleColors.background,
    color: roleColors.text
  }}
>
  {user.role}
</div>
```

**Role color mappings:**
- `admin` → Red palette
- `manager` → Blue palette
- `member` → Gray palette
- `test` → Yellow palette

## Accessibility

### Contrast Ratios

The color system includes utilities for checking contrast ratios:

```tsx
import { colorUtils } from '@/lib/color-utils';

const meetsAA = colorUtils.meetsWCAGAA('#000000', '#ffffff');
const meetsAAA = colorUtils.meetsWCAGAAA('#000000', '#ffffff');
```

### Best Practices

1. **Always use semantic colors** instead of hardcoded values
2. **Test color combinations** for sufficient contrast
3. **Provide alternative indicators** beyond color alone
4. **Use the provided utility functions** for consistency

## Adding New Colors

### 1. Add to Base Colors

```typescript
// In lib/colors.ts
export const baseColors = {
  // ... existing colors
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    // ... rest of scale
  },
};
```

### 2. Update Tailwind Config

```typescript
// In tailwind.config.js
colors: {
  ...baseColors,
  // ... rest of config
}
```

### 3. Add Semantic Usage

```typescript
// In lib/colors.ts
export const semanticColors = {
  // ... existing colors
  warning: {
    background: baseColors.orange[50],
    border: baseColors.orange[200],
    text: baseColors.orange[800],
  },
};
```

## Migration Guide

### From Hardcoded Colors

```tsx
// ❌ Before
<div className="bg-blue-600 text-white">
<button className="bg-red-500 hover:bg-red-600">

// ✅ After  
<div className="bg-primary text-primary-foreground">
<button className="bg-destructive hover:bg-red-700">
```

### From Inline Styles

```tsx
// ❌ Before
<div style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>

// ✅ After
<div className="bg-primary text-primary-foreground">
// or
<div style={{ backgroundColor: getColor('primary.DEFAULT') }}>
```

## Troubleshooting

### Common Issues

1. **Colors not updating**: Ensure you're using semantic class names, not hardcoded ones
2. **Dark mode not working**: Check that CSS variables are properly defined
3. **TypeScript errors**: Import the correct types from the colors file

### Debugging

```tsx
import { getColor } from '@/lib/colors';

// Debug color values
console.log('Primary color:', getColor('primary.DEFAULT'));
console.log('Blue 600:', getColor('blue.600'));
```

## Examples

### Button Component

```tsx
const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-blue-700',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-gray-200',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-red-700',
};
```

### Alert Component

```tsx
const alertVariants = {
  success: 'bg-success-50 border-success-200 text-success-800',
  error: 'bg-error-50 border-error-200 text-error-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-info-50 border-info-200 text-info-800',
};
```

### User Role Badge

```tsx
import { getRoleColors } from '@/lib/color-utils';

function RoleBadge({ role }: { role: string }) {
  const colors = getRoleColors(role);
  
  return (
    <span 
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: colors.background,
        color: colors.text
      }}
    >
      {role}
    </span>
  );
}
```

This color system provides a solid foundation for maintaining consistent, accessible, and maintainable colors throughout the Consensus application.
