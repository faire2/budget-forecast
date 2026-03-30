# Design System

**Last updated:** 2026-03-27

## Design Tokens

### Colors (Tailwind Semantic Tokens)

Use semantic tokens from shadcn/ui theme system:

- `bg-background` - Main background color
- `bg-foreground` - Main text color
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions
- `bg-muted` / `text-muted-foreground` - Muted backgrounds and subtle text
- `bg-accent` / `text-accent-foreground` - Accent elements
- `bg-destructive` / `text-destructive-foreground` - Destructive actions
- `border` - Border color
- `ring` - Focus ring color

### Typography

- Use Tailwind typography utilities (`text-sm`, `text-base`, `text-lg`, etc.)
- Font family: System font stack (configured in Tailwind)
- Font weights: `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700)

### Spacing

- Use Tailwind spacing scale (`p-4`, `m-2`, `gap-4`, etc.)
- Base unit: 0.25rem (4px)
- Common spacing: 2 (8px), 4 (16px), 6 (24px), 8 (32px)

### Layout

- Mobile-first responsive design
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Max content width: `max-w-7xl` for main container
- Padding: `px-4 sm:px-6 lg:px-8` for responsive horizontal padding

## Component Patterns

### shadcn/ui Primitives

Always use shadcn/ui primitives when available:

- **Button** - All clickable actions
- **Input** - Text inputs
- **Select** - Dropdowns
- **Dialog** - Modals
- **Form** - Form fields with validation
- **Card** - Content containers
- **Badge** - Labels and tags
- **Separator** - Visual dividers
- **Label** - Form labels
- **Textarea** - Multi-line text input

### Icons

- Use `lucide-react` for all icons
- Common icons: Plus, Trash2, Edit2, Calendar, DollarSign, Check, X

### States

- **Loading**: Use `isPending` from TanStack Query + skeleton components
- **Error**: Use toast notifications or inline error messages
- **Empty**: Show helpful empty states with call-to-action
- **Disabled**: Use `disabled` prop + `opacity-50 cursor-not-allowed`

## Accessibility

- Use semantic HTML (`<button>`, `<input>`, `<form>`)
- Include ARIA labels where needed (`aria-label`, `aria-describedby`)
- Ensure keyboard navigation works (tab order, focus states)
- Maintain color contrast ratios (WCAG AA minimum)

## Examples

### Button Variants

```tsx
<Button>Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Action</Button>
<Button variant="ghost">Ghost Action</Button>
<Button variant="destructive">Delete</Button>
```

### Form Field

```tsx
<div className="space-y-2">
  <Label htmlFor="amount">Amount</Label>
  <Input
    id="amount"
    type="number"
    placeholder="0.00"
    className="w-full"
  />
</div>
```

### Card Layout

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```
