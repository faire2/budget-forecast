# Component Catalog

**Last updated:** 2026-03-26

Component inventory for Budget Forecast App. **Always check this file before creating new components.**

## shadcn/ui Primitives

These components are available via shadcn/ui. Use these first before building custom components.

### Form Components
- **Button** - Primary actions, secondary actions, ghost buttons
  - Variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`
  - Use for: All clickable actions
- **Input** - Text inputs
  - Use for: Text fields, number inputs, date inputs
- **Textarea** - Multi-line text inputs
  - Use for: Notes, descriptions
- **Label** - Form labels
  - Use for: Labeling form fields
- **Select** - Dropdown selections
  - Use for: Choosing from predefined options (e.g., income/expense type)
- **Checkbox** - Boolean inputs
  - Use for: Toggle options
- **Radio Group** - Single selection from options
  - Use for: Mutually exclusive choices
- **Form** - Form wrapper with react-hook-form integration
  - Use for: All forms with validation

### Layout Components
- **Card** - Content containers
  - Variants: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - Use for: Grouping related content
- **Separator** - Visual dividers
  - Use for: Separating sections
- **Accordion** - Collapsible sections
  - Use for: Expandable content (e.g., day details in forecast)

### Overlay Components
- **Dialog** - Modal dialogs
  - Variants: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - Use for: Entry forms, confirmations, complex interactions
- **Popover** - Floating content
  - Use for: Calendar picker, contextual menus
- **Toast** - Notifications
  - Use for: Success/error messages
- **Alert Dialog** - Confirmation dialogs
  - Use for: Delete confirmations, destructive actions

### Navigation Components
- **Calendar** - Date picker
  - Use for: Date selection in entry form, calendar navigation
- **Tabs** - Tab navigation
  - Use for: Switching between views (if needed in future)

## Custom Components

Components built for this application. Update this section when creating new components.

### Data Display Components

#### BalanceAnchor
- **Purpose:** Display and edit the current balance anchor
- **Location:** `/client/src/components/BalanceAnchor.tsx`
- **Props:**
  - `balance: number` - Current balance in cents
  - `asOfDate: string` - ISO date string
  - `onUpdate: (balance: number) => void` - Update callback
- **Usage:**
```tsx
<BalanceAnchor
  balance={50000}
  asOfDate="2026-03-26"
  onUpdate={(newBalance) => updateBalance(newBalance)}
/>
```

#### DayList
- **Purpose:** Display 30-day forecast as collapsible list with summary rows
- **Location:** `/client/src/components/DayList.tsx`
- **Props:**
  - `days: DailyProjection[]` - Array of daily projections from forecast API
  - `expandedDate: string | null` - Currently expanded date (ISO YYYY-MM-DD)
  - `onDayClick: (date: string) => void` - Expansion toggle callback
- **Features:**
  - Shows date, total income, total expenses, and projected balance per row
  - Current day highlighted with accent color and left border
  - Clickable rows expand to show detailed entries via DayDetail
  - Currency formatting with Intl.NumberFormat
  - Date formatting with date-fns (e.g., "Mon, Mar 27")
  - Negative balances displayed in destructive color
- **Usage:**
```tsx
import { DayList } from '@/components/DayList';

<DayList
  days={forecastData}
  expandedDate={selectedDate}
  onDayClick={(date) => setSelectedDate(date === selectedDate ? null : date)}
/>
```

#### DayDetail
- **Purpose:** Display detailed entries for an expanded day
- **Location:** `/client/src/components/DayDetail.tsx`
- **Props:**
  - `entries: ProjectedEntry[]` - Entries for the expanded day
- **Features:**
  - Shows each entry with type icon (TrendingUp/TrendingDown from lucide-react)
  - Displays amount, type badge, note, and recurring indicator
  - Skipped entries: grayed out with line-through styling
  - Income entries: accent color
  - Expense entries: muted color
  - Recurring entries: show repeat icon and "Recurring" label
  - Empty state when no entries
- **Usage:**
```tsx
import { DayDetail } from '@/components/DayDetail';

// Used internally by DayList when day is expanded
{isExpanded && (
  <div className="border-t border-border bg-muted/30">
    <DayDetail entries={day.entries} />
  </div>
)}
```

### Form Components

#### EntryForm
- **Purpose:** Create income/expense entries (MVP - editing comes in later phase)
- **Location:** `/client/src/components/EntryForm.tsx`
- **Props:**
  - `onSubmit: (data: EntryFormData) => void` - Form submission callback
  - `onCancel?: () => void` - Cancel callback (optional)
- **Form Data Type:**
  - `EntryFormData`: `{ amount: number (cents), type: 'income' | 'expense', date: string (ISO), note: string }`
- **Features:**
  - Dollar-to-cents conversion (user enters dollars, stores as cents)
  - Client-side validation (amount > 0, date required)
  - Semantic Tailwind styling with design tokens
  - Auto-resets after successful submission
- **Usage:**
```tsx
// Create new entry in Dialog
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Entry</DialogTitle>
    </DialogHeader>
    <EntryForm
      onSubmit={(data) => createEntry(data)}
      onCancel={() => setOpen(false)}
    />
  </DialogContent>
</Dialog>
```

### Navigation Components

#### CalendarNav (Planned - Phase 5)
- **Purpose:** Mini monthly calendar for date navigation
- **Location:** `/client/src/components/CalendarNav.tsx`
- **Props:**
  - `selectedDate: string` - Currently selected date
  - `onDateSelect: (date: string) => void` - Date selection callback
  - `daysWithEntries: string[]` - Dates to highlight
- **Usage:**
```tsx
<CalendarNav
  selectedDate="2026-03-26"
  onDateSelect={(date) => navigateToDate(date)}
  daysWithEntries={datesWithData}
/>
```

## Component Usage Guidelines

### When to Use Existing Components

1. **Always check shadcn/ui first** - Most UI needs are covered by primitives
2. **Check custom components** - Reuse domain-specific components
3. **Compose before creating** - Combine primitives before building custom
4. **Ask before building** - If unsure, consult AGENTS.md or ask user

### When to Create New Components

Create a new custom component when:
- The UI pattern is domain-specific (e.g., forecast day row)
- The component will be reused in multiple places
- The component encapsulates complex business logic
- Composing primitives becomes unwieldy (>50 lines inline)

**Don't create new components for:**
- One-off layouts (use inline JSX)
- Simple compositions of 2-3 primitives
- Styling variations (use props/variants instead)

### Component Creation Checklist

When creating a new custom component:
1. ✓ Check this catalog to avoid duplication
2. ✓ Use shadcn/ui primitives as building blocks
3. ✓ Follow TypeScript strict rules (no `any` types)
4. ✓ Use semantic Tailwind classes from DESIGN-SYSTEM.md
5. ✓ Define prop types with clear JSDoc comments
6. ✓ Update this catalog with the new component
7. ✓ Update docs/DOC_CATALOG.md if creating component-specific docs

## Examples

### Good Component Reuse

```tsx
// ✅ Using existing Button primitive with variants
<Button variant="destructive" onClick={handleDelete}>
  Delete Entry
</Button>

// ✅ Composing Card primitives for layout
<Card>
  <CardHeader>
    <CardTitle>Daily Forecast</CardTitle>
  </CardHeader>
  <CardContent>
    <DayList days={forecast} />
  </CardContent>
</Card>

// ✅ Using Dialog for entry form
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Add Entry</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Entry</DialogTitle>
    </DialogHeader>
    <EntryForm onSubmit={handleSubmit} />
  </DialogContent>
</Dialog>
```

### Poor Component Usage

```tsx
// ❌ Creating custom button instead of using shadcn Button
function CustomButton({ children, onClick }) {
  return <div onClick={onClick} className="custom-btn">{children}</div>;
}

// ❌ Duplicating Card structure instead of using Card primitive
function CustomCard({ title, content }) {
  return (
    <div className="rounded-lg border p-6">
      <h3>{title}</h3>
      <div>{content}</div>
    </div>
  );
}

// ❌ Creating wrapper for simple composition
function InputWithLabel({ label, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}
// Instead: Just compose inline in the form
```

## Reference

- shadcn/ui components: https://ui.shadcn.com/docs/components
- DESIGN-SYSTEM.md: Design tokens and patterns
- AGENTS.md: Component reuse rules
