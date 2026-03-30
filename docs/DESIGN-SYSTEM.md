# Design System

**Last updated:** 2026-03-26

Design tokens and patterns for Budget Forecast App. Based on shadcn/ui + Tailwind CSS.

## Color Tokens

Use semantic color classes from shadcn/ui. Never use direct color values like `bg-blue-600`.

### Semantic Colors

```css
/* Primary - Main brand color for primary actions */
bg-primary, text-primary, border-primary
bg-primary-foreground, text-primary-foreground

/* Secondary - Supporting color for secondary actions */
bg-secondary, text-secondary, border-secondary
bg-secondary-foreground, text-secondary-foreground

/* Muted - Subtle backgrounds and borders */
bg-muted, text-muted, border-muted
bg-muted-foreground, text-muted-foreground

/* Accent - Highlight and emphasis */
bg-accent, text-accent, border-accent
bg-accent-foreground, text-accent-foreground

/* Destructive - Errors and delete actions */
bg-destructive, text-destructive, border-destructive
bg-destructive-foreground, text-destructive-foreground

/* Background - Page and card backgrounds */
bg-background, text-background

/* Foreground - Default text color */
text-foreground

/* Card - Card containers */
bg-card, border-card
text-card-foreground

/* Popover - Popover/dropdown containers */
bg-popover, border-popover
text-popover-foreground

/* Border - Default borders */
border-border

/* Input - Form input backgrounds */
bg-input

/* Ring - Focus rings */
ring-ring
```

### Usage Examples

```tsx
// ✅ Correct - semantic tokens
<Button className="bg-primary text-primary-foreground">
  Save
</Button>

<div className="bg-muted text-muted-foreground">
  Subtle info panel
</div>

// ❌ Incorrect - direct colors
<Button className="bg-blue-600 text-white">
  Save
</Button>
```

## Typography

### Font Scale

```css
text-xs    /* 12px - Captions, labels */
text-sm    /* 14px - Secondary text, helper text */
text-base  /* 16px - Body text (default) */
text-lg    /* 18px - Emphasized body text */
text-xl    /* 20px - Small headings */
text-2xl   /* 24px - Section headings */
text-3xl   /* 30px - Page headings */
text-4xl   /* 36px - Large headings */
```

### Font Weights

```css
font-normal   /* 400 - Body text */
font-medium   /* 500 - Emphasized text, labels */
font-semibold /* 600 - Headings, buttons */
font-bold     /* 700 - Strong emphasis */
```

### Usage Guidelines

- Body text: `text-base font-normal`
- Labels: `text-sm font-medium`
- Section headings: `text-2xl font-semibold`
- Buttons: `text-sm font-medium`
- Helper text: `text-sm text-muted-foreground`

## Spacing System

Use Tailwind's spacing scale based on 0.25rem (4px) increments.

### Common Spacing

```css
p-1   /* 4px padding */
p-2   /* 8px padding */
p-3   /* 12px padding */
p-4   /* 16px padding - Default component padding */
p-6   /* 24px padding - Card padding */
p-8   /* 32px padding - Section padding */

gap-1  /* 4px gap */
gap-2  /* 8px gap - Tight spacing */
gap-4  /* 16px gap - Default spacing */
gap-6  /* 24px gap - Loose spacing */
gap-8  /* 32px gap - Section spacing */
```

### Layout Guidelines

- Component internal padding: `p-4`
- Card padding: `p-6`
- Form field spacing: `gap-4`
- Section spacing: `gap-8`
- Page margins: `p-8` or `px-8 py-6`

## Component Patterns

### Cards

```tsx
<div className="bg-card border border-border rounded-lg p-6">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-sm text-muted-foreground">Card content</p>
</div>
```

### Form Fields

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Label</label>
  <Input className="bg-input border-border" />
  <p className="text-xs text-muted-foreground">Helper text</p>
</div>
```

### Buttons

```tsx
// Primary action
<Button className="bg-primary text-primary-foreground">
  Primary
</Button>

// Secondary action
<Button variant="secondary">
  Secondary
</Button>

// Destructive action
<Button variant="destructive">
  Delete
</Button>

// Ghost/subtle action
<Button variant="ghost">
  Cancel
</Button>
```

### List Items

```tsx
// Hoverable list item
<div className="p-4 hover:bg-muted rounded-md cursor-pointer">
  List item content
</div>

// Selected list item
<div className="p-4 bg-accent text-accent-foreground rounded-md">
  Selected item content
</div>
```

## Responsive Design

Mobile-first approach using Tailwind breakpoints.

### Breakpoints

```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Usage Pattern

```tsx
// Mobile-first: Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// Mobile: Full width, Desktop: Fixed width
<div className="w-full md:w-96">
  Content
</div>
```

## Accessibility

### Focus States

Always ensure visible focus indicators using `ring` classes.

```tsx
<button className="focus:ring-2 focus:ring-ring focus:outline-none">
  Accessible button
</button>
```

### Color Contrast

- Ensure sufficient contrast between text and background
- Use foreground colors designed for their background tokens
- Test with `text-muted-foreground` for subtle text

### Interactive Elements

- Minimum touch target: 44x44px
- Clear hover states: `hover:bg-muted`
- Clear active states: `active:scale-95`
- Disabled states: `disabled:opacity-50 disabled:pointer-events-none`

## Icons

Use lucide-react for all icons.

```tsx
import { Calendar, Plus, Trash2 } from 'lucide-react';

// Default size: 16px (h-4 w-4)
<Calendar className="h-4 w-4" />

// Medium size: 20px (h-5 w-5)
<Plus className="h-5 w-5" />

// Large size: 24px (h-6 w-6)
<Trash2 className="h-6 w-6" />
```

## Animation

Use Tailwind's built-in transitions for smooth interactions.

```tsx
// Hover transitions
<div className="transition-colors hover:bg-muted">
  Content
</div>

// Scale on interaction
<button className="transition-transform active:scale-95">
  Button
</button>

// Fade in
<div className="transition-opacity opacity-0 animate-in fade-in">
  Content
</div>
```

## Domain-Specific Patterns

### Money Display

```tsx
// Positive amounts (income) - use accent color
<span className="text-accent-foreground font-medium">
  {formatCurrency(amount)}
</span>

// Negative amounts (expenses) - use muted or destructive
<span className="text-muted-foreground font-medium">
  -{formatCurrency(amount)}
</span>

// Balance - use semantic color based on positive/negative
<span className={balance >= 0 ? "text-foreground" : "text-destructive"}>
  {formatCurrency(balance)}
</span>
```

### Date Display

```tsx
// Current date - emphasize
<time className="text-foreground font-medium">
  {formatDate(date)}
</time>

// Past/future dates - subtle
<time className="text-muted-foreground text-sm">
  {formatDate(date)}
</time>
```

### Entry Status

```tsx
// Active entry
<div className="bg-card border-border">Entry</div>

// Skipped entry - grayed out
<div className="bg-muted/50 text-muted-foreground line-through">
  Skipped entry
</div>

// Edited entry - show indicator
<div className="bg-accent/10 border-accent">
  Edited entry
</div>
```

## Reference

- shadcn/ui documentation: https://ui.shadcn.com
- Tailwind CSS documentation: https://tailwindcss.com
- lucide-react icons: https://lucide.dev
