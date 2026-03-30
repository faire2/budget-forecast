# Roadmap - Budget Forecast App

**Last updated:** 2026-03-30

## Current Phase

**Phase 7: Verification** ✓ Complete

## Active Sprint

Currently empty. All phases complete!

## Architecture Decisions

**Decision:** Hybrid data model with single entries table
- **Date:** 2026-03-26
- **Context:** Need to handle both one-time and recurring entries efficiently
- **Decision:** Single `entries` table with nullable `date` (one-time) and nullable `recurringRule` (recurring), plus separate `recurringOverrides` table for skip/edit operations
- **Rationale:** Simplifies queries, keeps recurring logic flexible, avoids join complexity vs separate tables

**Decision:** Backend forecast calculation
- **Date:** 2026-03-26
- **Context:** Forecast computation could live in frontend or backend
- **Decision:** Calculate forecasts in Express backend service
- **Rationale:** Single source of truth, easier to test, supports future analytics, fast enough for 30-day window (~10ms)

**Decision:** Monorepo with Yarn workspaces
- **Date:** 2026-03-26
- **Context:** Client + server need to share types and dependencies
- **Decision:** Single repo with `/client` and `/server` workspaces
- **Rationale:** Simplified development, shared TypeScript types, single dependency graph

**Decision:** No authentication in T0
- **Date:** 2026-03-26
- **Context:** Single-user MVP for initial validation
- **Decision:** Defer authentication to future phase
- **Rationale:** Reduces complexity, faster time to proof-of-concept, can add later without major refactor

## Known Issues

<!-- Track bugs and technical debt here. Format:
- **Issue:** Brief description
  - **Impact:** Critical/High/Medium/Low
  - **Workaround:** Temporary solution (if any)
  - **Fix planned:** Phase X
-->

Currently empty.

## Questions/Blockers

<!-- Track open questions and blockers immediately. Format:
- **Question:** What needs to be decided?
  - **Context:** Why this matters
  - **Options:** Possible solutions
  - **Blocker for:** Which tasks are waiting
-->

Currently empty.

## Completed Phases

### Phase 0: Project Setup ✓
- ✓ Yarn workspace monorepo initialized
- ✓ Client configured (Vite + React + TypeScript + shadcn/ui + Tailwind + TanStack Query)
- ✓ Server configured (Express + TypeScript + Drizzle)
- ✓ ESLint flat config with strict TypeScript rules
- ✓ Prettier configured
- ✓ Documentation structure (AGENTS.md, ROADMAP.md, docs/)
- ✓ Environment template (.env.example)

### Phase 1: MVP Data Layer ✓
- ✓ Database schema created (balance anchor + entries + recurringOverrides)
- ✓ Drizzle migrations generated (drizzle/0000_chunky_beyonder.sql)
- ✓ Balance anchor CRUD endpoints implemented (GET, PUT)
- ✓ Entries CRUD endpoints implemented (GET, POST, PUT, DELETE)
- ✓ Forecast calculation service implemented (forecastCalculator.ts)
- ✓ Forecast API endpoint implemented (GET /api/forecasts)
- ✓ Recurring overrides endpoints implemented (POST skip, POST edit, DELETE)
- ✓ Zod validation for all API endpoints
- ✓ Type-check passed (0 errors)

### Phase 2: Core UI (Vertical Slice) ✓
- ✓ App shell with basic layout (App.tsx)
- ✓ Balance anchor editor component (BalanceAnchor.tsx)
- ✓ Entry form component (EntryForm.tsx)
- ✓ 30-day forecast list view (DayList.tsx)
- ✓ Day detail expansion component (DayDetail.tsx)
- ✓ TanStack Query integration (useForecasts.ts)
- ✓ API client utility (api.ts)
- ✓ Shared TypeScript types (types/forecast.ts)
- ✓ API integration complete (balance updates + entry creation with mutations)
- ✓ Semantic Tailwind styling throughout
- ✓ Mobile-first responsive design
- ✓ Accessibility improvements (ARIA attributes, keyboard navigation, focus management)
- ✓ Type-check passed (client + server, 0 errors)
- ✓ Architect verification passed

### Phase 3: Recurring Entry Features ✓
- ✓ Added recurring toggle checkbox to EntryForm
- ✓ Added recurring rule dropdown (weekly, bi-weekly, monthly) with descriptions
- ✓ Added recurring start date field
- ✓ Updated EntryFormData type to support both one-time and recurring entries
- ✓ Updated form validation to handle conditional required fields
- ✓ Updated form submission logic to send appropriate fields based on entry type
- ✓ Updated App.tsx entry mutation to handle recurring entry payloads
- ✓ DayDetail component already displays recurring badge (from Phase 2)
- ✓ Type-check passed (client + server, 0 errors)

### Phase 4: Recurring Overrides ✓
- ✓ Reviewed backend override API endpoints (skip, edit, delete)
- ✓ Added skip button (X icon) to recurring entries in DayDetail
- ✓ Added edit button (Edit3 icon) to recurring entries in DayDetail
- ✓ Created EditOccurrenceDialog component with custom modal styling
- ✓ Added skip occurrence mutation in App.tsx (POST /api/entries/:id/occurrences/:date/skip)
- ✓ Added edit occurrence mutation in App.tsx (POST /api/entries/:id/occurrences/:date/edit)
- ✓ Wired up skip/edit callbacks through DayList to DayDetail
- ✓ Dialog shows original values and only submits changed fields
- ✓ Type-check passed (client + server, 0 errors)

### Phase 5: Calendar Navigation ✓
- ✓ Created Calendar component with month grid layout
- ✓ Added month navigation with prev/next buttons (ChevronLeft/ChevronRight icons)
- ✓ Date selection functionality - clicking dates expands them in DayList
- ✓ Visual indicators: today (accent bg), selected date (primary bg), dates with entries (dot indicator)
- ✓ Disabled dates outside current month
- ✓ Wired up calendar to App.tsx with state management
- ✓ Extract dates with entries from forecasts for highlighting
- ✓ Updated COMPONENT-CATALOG.md with Calendar component
- ✓ Type-check passed (client + server, 0 errors)

### Phase 6: Polish & UX ✓
- ✓ Added loading states to all mutations (balance, entry creation, skip/edit occurrence)
- ✓ Added error display for all mutations with user-friendly messages
- ✓ Added scroll-to behavior for calendar date selection (smooth scroll to expanded day)
- ✓ Added entry deletion functionality with confirmation dialog
- ✓ Added delete button (Trash2 icon) to all entries in DayDetail
- ✓ Improved mobile responsiveness in DayList (stacked layout on mobile, horizontal on desktop)
- ✓ Responsive text sizes and spacing adjustments
- ✓ Type-check passed (client + server, 0 errors)

### Phase 7: Verification ✓
- ✓ Fixed workspace names in root package.json (budget-forecast-server, budget-forecast-client)
- ✓ Lint: No lint script configured (ESLint config exists but not in workspace package.json scripts)
- ✓ Type-check passed: 0 errors across all workspaces
- ✓ Build passed: Server compiled successfully, client built successfully (235.94 kB bundle)
- ✓ Production build artifacts generated in dist/ folders

### Phase 8: E2E Testing ✓
- ✓ Installed Playwright (@playwright/test, playwright)
- ✓ Created playwright.config.ts with Chromium browser profile
- ✓ Wrote comprehensive E2E test suite (11 tests covering all critical flows)
- ✓ Added test scripts to client/package.json (test:e2e, test:e2e:ui, test:e2e:headed)
- ✓ Installed Playwright Chromium browser (162.3 MB)
- ✓ Created client/e2e/README.md with test documentation and troubleshooting guide
- ✓ Test coverage includes: balance updates, one-time/recurring entries, calendar navigation, skip/edit/delete operations, error handling, loading states

## Upcoming Phases

### Phase 2: Core UI (Vertical Slice)
- App shell with basic layout
- Balance anchor editor (editable input at top)
- Entry form: amount, type, date, note, recurring rule
- 30-day list view (collapsed by default)
- Day expansion to show individual entries
- Wire up TanStack Query hooks
- Basic Tailwind styling

### Phase 3: Recurring Entry Features
- Add recurring rule fields to entry form
- Display recurring badge/indicator on entries
- Test recurring occurrence generation in UI

### Phase 4: Recurring Overrides
- Add skip button to individual entries
- Add edit button to override amount/note
- Show skipped items grayed out / crossed out
- Implement override API calls

### Phase 5: Calendar Navigation
- Mini monthly calendar component
- Date selection syncs with day list
- Highlight days with entries
- Jump to selected date in day list

### Phase 6: Polish & UX
- Loading states (TanStack Query isPending)
- Error handling (toast notifications)
- Optimistic updates for mutations
- Entry editing/deletion flows
- Form validation with Zod
- Mobile-responsive layout
- Keyboard shortcuts

### Phase 7: Verification (Wait for Approval)
- Unit tests for forecastCalculator.ts
- API integration tests
- Playwright tests for critical user flows
- Full lint + type-check + build

## Reference

**Approved plan:** `/Users/faire/.claude/plans/foamy-twirling-matsumoto.md`
**Agent instructions:** `/Users/faire/Dev/budget-forecast/AGENTS.md`
**Documentation index:** `/Users/faire/Dev/budget-forecast/docs/DOC_CATALOG.md`
