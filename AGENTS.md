# Agent Instructions - Budget Forecast App

**Last updated:** 2026-03-31

## Project Context

Budget forecasting SPA for therapists with irregular income. Stack: Vite + React + TypeScript + Vercel Serverless Functions + Neon Postgres + Drizzle ORM + shadcn/ui + Tailwind + TanStack Query.

**Architecture:** Vercel deployment with serverless functions in `/api`, shared code in `/shared`, frontend in `/client`.

**Approved plan:** `/Users/faire/.claude/plans/foamy-twirling-matsumoto.md`

## Core Workflow

### 1. Before Starting Work
- Read the approved plan to understand architecture decisions
- Check ROADMAP.md for current phase and active sprint
- Review COMPONENT-CATALOG.md before creating UI components
- Check DOC_CATALOG.md for relevant documentation

### 2. Planning New Features
- Create implementation plan first
- Get user approval before executing
- Break work into phases matching the approved plan
- Document architectural decisions in ROADMAP.md

### 3. Executing Work
- Follow the approved plan's phase order (0 → 1 → 2 → 3...)
- Update ROADMAP.md Active Sprint section with current tasks
- Mark blockers/questions in ROADMAP.md immediately
- Update COMPONENT-CATALOG.md when adding UI components
- Keep DOC_CATALOG.md updated when creating docs

## Working Agreements

### Git & Verification
- **NEVER create git commits or push to remote**
- **NEVER run full verification (lint/test/build) without explicit user approval**
- User will handle git operations manually
- Request approval before running `yarn lint`, `yarn test`, `yarn build`

### Code Changes & Verification
- Make minimal, focused changes
- Prefer editing existing files over creating new ones
- **CRITICAL: Always verify with the actual build command, not filtered checks**
- When type-checking, include ALL affected directories (don't filter to only one path)
- Show verification output (don't assume it passes)

### Testing & Temporary Files
- **Use `.test-temp/` folder** for all Playwright tests, test scripts, and temporary files
- This folder is gitignored and safe for experimentation
- **Clean up when done**: Delete test files from `.test-temp/` after completing work
- Screenshot paths: Use `/tmp/` for Playwright screenshots (system temp directory)
- Example test file location: `.test-temp/test-calendar-interaction.mjs`

### Verification Protocol
When making changes that affect multiple directories:

```bash
# ❌ WRONG - filters hide transitive dependency errors
npx tsc --noEmit api/**/*.ts | grep "^api/"

# ✅ CORRECT - check all affected code
npx tsc --noEmit api/**/*.ts shared/**/*.ts

# ✅ BEST - run the actual build command
cd client && yarn build
```

**Why this matters:** Filtering type-check output can hide errors in imported dependencies. Always verify the full dependency chain, especially when:
- Creating new shared code in `/shared`
- Changing import paths between directories
- Moving files between workspaces
- Updating package dependencies

## TypeScript Rules

### Strict Types (Non-Negotiable)
```typescript
// ❌ NEVER use 'any'
function process(data: any) { }

// ✅ Use 'unknown' + type guards
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Safe to use after validation
  }
}

// ✅ Use proper types from schema
import { type Entry } from '@/db/schema';

// ✅ Zod for runtime validation
import { z } from 'zod';
const EntrySchema = z.object({
  amount: z.number(),
  type: z.enum(['income', 'expense']),
});
```

### Type Safety Patterns
- Use Drizzle's inferred types from schema
- Use Zod for API validation + TypeScript inference
- Prefer `type` over `interface` for consistency
- Use strict null checks (no optional chaining abuse)

## React & UI Rules

### Component Reuse
1. **Always check COMPONENT-CATALOG.md first**
2. **Use shadcn/ui primitives** (Button, Input, Dialog, Form, etc.)
3. **Only create custom components** when no primitive exists
4. **Update COMPONENT-CATALOG.md** when adding custom components

### Component Patterns
```typescript
// ✅ Collocate types with components
type DayListProps = {
  days: DayProjection[];
  onDayClick: (date: string) => void;
};

export function DayList({ days, onDayClick }: DayListProps) {
  // Implementation
}

// ✅ Use TanStack Query for server state
import { useQuery, useMutation } from '@tanstack/react-query';

export function useForecasts(start: string, end: string) {
  return useQuery({
    queryKey: ['forecasts', start, end],
    queryFn: () => fetchForecasts(start, end),
    staleTime: 30_000,
  });
}

// ✅ Use semantic Tailwind classes
<div className="bg-primary text-primary-foreground">
// ❌ NOT: bg-blue-600 text-white
```

### Styling Guidelines
- Use shadcn/ui design tokens from DESIGN-SYSTEM.md
- Tailwind with semantic tokens only
- lucide-react for icons
- Mobile-first responsive design

## Documentation Rules

### Required Documentation
- **Collocate docs with code** (e.g., `components/README.md`)
- **Update DOC_CATALOG.md** when creating new docs
- **Document component usage** in COMPONENT-CATALOG.md
- **Track decisions** in ROADMAP.md Architecture Decisions section

### Documentation Format
```markdown
# Component Name

## Purpose
One sentence explaining what this does.

## Usage
\`\`\`typescript
<Component prop="value" />
\`\`\`

## Props
- `prop`: Description
```

## Roadmap Update Protocol

### When to Update ROADMAP.md
- Starting a new phase → Update Current Phase
- Beginning work on tasks → Add to Active Sprint
- Making architectural decisions → Add to Architecture Decisions
- Encountering blockers → Add to Questions/Blockers
- Finding bugs → Add to Known Issues

### Update Format
```markdown
## Active Sprint
- [ ] Task description (Phase X)
- [x] Completed task

## Architecture Decisions
**Decision:** Brief title
- **Date:** YYYY-MM-DD
- **Context:** Why we needed to decide
- **Decision:** What we chose
- **Rationale:** Why this choice
```

## Domain-Specific Rules

### Money Handling
- Database: `decimal(12, 2)`
- Frontend: Integer cents (`amount * 100`)
- Display: Format with `Intl.NumberFormat`

### Date Handling
- Use `date-fns` for all date operations
- Store dates as ISO strings (`YYYY-MM-DD`)
- Use user's local timezone for display

### Forecasting Logic
- Balance anchor is "current balance as of today"
- Forecast always starts from anchor (not historical ledger)
- Recurring rules: weekly (7d), bi-weekly (14d), monthly (same day)
- Skipped occurrences: show grayed/crossed out, exclude from balance
- Edited occurrences: use override amount, include in balance

## Project Structure

```
budget-forecast/
├── api/                    # Vercel serverless functions
│   ├── balance.ts         # Balance anchor API
│   ├── forecasts.ts       # Forecast calculation API
│   └── entries/           # Entry CRUD + overrides
├── shared/                # Shared code (used by /api)
│   ├── db/               # Database client & schema
│   ├── services/         # Business logic (forecast calculator)
│   └── types/            # TypeScript types
├── client/               # React frontend (Vite)
└── server/               # Legacy workspace (minimal, for drizzle-kit only)
```

**Key Architectural Note:** Dependencies like `drizzle-orm`, `zod`, `date-fns` are in the **root** `package.json` to avoid version conflicts between `/api` and `/shared`.

## Critical Files (Priority Order)

1. `/shared/db/schema.ts` - Database schema
2. `/shared/services/forecastCalculator.ts` - Core forecast logic
3. `/api/forecasts.ts` - Main API endpoint (serverless)
4. `/client/src/hooks/useForecasts.ts` - Server state management
5. `/client/src/components/DayListCompact.tsx` - Main UI view
6. `/AGENTS.md` - This file (source of truth)

## Implementation Phases (from Plan)

- **Phase 0:** Project setup ✓
- **Phase 1:** MVP data layer (schema + API + forecast calculator)
- **Phase 2:** Core UI (balance anchor + entry form + day list)
- **Phase 3:** Recurring entry features
- **Phase 4:** Recurring overrides
- **Phase 5:** Calendar navigation
- **Phase 6:** Polish & UX
- **Phase 7:** Verification (wait for approval)

## Common Pitfalls to Avoid

- ❌ Using `any` types
- ❌ Creating components without checking COMPONENT-CATALOG.md
- ❌ Forgetting to update ROADMAP.md when starting work
- ❌ Running full verification without approval
- ❌ Creating git commits
- ❌ Using non-semantic Tailwind classes
- ❌ Skipping type validation on API boundaries
- ❌ Forgetting to update DOC_CATALOG.md for new docs
- ❌ **Filtering type-check output that hides transitive dependency errors**
- ❌ **Not checking `/shared` when verifying `/api` changes**
- ❌ **Adding duplicate dependencies in workspace packages (always use root for shared deps)**

## Questions or Blockers?

Add to ROADMAP.md Questions/Blockers section immediately. Don't wait until work is blocked.
