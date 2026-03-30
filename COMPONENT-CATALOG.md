# Component Catalog

**Last updated:** 2026-03-30

## shadcn/ui Primitives

Before creating custom components, check if a shadcn/ui primitive exists.

### Installed Components

(Empty - to be populated as components are installed)

## Custom Components

### App Components

**BalanceAnchor** (`components/BalanceAnchor.tsx`)
- Editable balance input with current date display
- Props: `balance` (cents), `asOfDate` (ISO string), `onUpdate` callback
- Used in: App.tsx

**EntryForm** (`components/EntryForm.tsx`)
- Form for creating one-time or recurring entries
- Supports: amount, type, date/recurring fields, note
- Props: `onSubmit`, `onCancel`
- Used in: App.tsx

**DayList** (`components/DayList.tsx`)
- List view of daily projections with expand/collapse
- Shows: date, income, expenses, balance for each day
- Props: `days`, `expandedDate`, `onDayClick`, `onSkipOccurrence`, `onEditOccurrence`
- Used in: App.tsx

**DayDetail** (`components/DayDetail.tsx`)
- Detailed entry list for a specific day
- Shows individual entries with skip/edit buttons for recurring entries
- Props: `entries`, `date`, `onSkip`, `onEdit`
- Used in: DayList.tsx

**Calendar** (`components/Calendar.tsx`)
- Mini calendar with month navigation
- Highlights: today, selected date, dates with entries
- Props: `selectedDate`, `datesWithEntries`, `onDateSelect`, `currentMonth`, `onMonthChange`
- Used in: App.tsx

**EditOccurrenceDialog** (`components/EditOccurrenceDialog.tsx`)
- Modal dialog for editing recurring occurrence overrides
- Allows editing amount and note for specific occurrence
- Props: `isOpen`, `date`, `originalAmount`, `originalNote`, `onSubmit`, `onClose`
- Used in: App.tsx

## Usage Guidelines

1. **Always check this catalog first** before creating a new component
2. **Prefer shadcn/ui primitives** over custom implementations
3. **Update this file** when installing new shadcn components or creating custom components
4. **Document props and usage** for custom components

## Installation

To install shadcn/ui components:

```bash
yarn --cwd client dlx shadcn@latest add <component-name>
```

Common components to install:
- button
- input
- card
- form
- label
- select
- dialog
- badge
- separator
