# E2E Tests - Budget Forecast App

## Overview

Comprehensive Playwright test suite covering all critical user flows for the Budget Forecast application.

## Prerequisites

Before running E2E tests, ensure the following:

1. **Database Setup**: Neon Postgres database must be configured
   - Copy `.env.example` to `.env` in the `/server` directory
   - Set `DATABASE_URL` to your Neon connection string
   - Run migrations: `cd server && yarn db:push`

2. **Dependencies Installed**: Run `yarn install` in the project root

3. **Server Running**: The Playwright config will auto-start the dev server, but you need a valid database connection

## Running Tests

### Headless Mode (CI/Default)
```bash
yarn test:e2e
```
Runs all tests in headless Chromium. Best for CI or quick validation.

### UI Mode (Recommended for Development)
```bash
yarn test:e2e:ui
```
Opens Playwright UI with time-travel debugging, watch mode, and visual trace viewer.

### Headed Mode (Watch Browser)
```bash
yarn test:e2e:headed
```
Runs tests in a visible browser window. Useful for debugging test failures.

## Test Coverage

The test suite (`budget-forecast.spec.ts`) includes 11 tests covering:

### 1. **Initial State** (`should display the app title and initial state`)
- App renders correctly
- Main sections visible (Add Entry, 30-Day Forecast)
- New Entry button present

### 2. **Balance Anchor** (`should update balance anchor`)
- Update current balance
- Verify mutation completes
- Balance persists

### 3. **One-Time Entry** (`should create a one-time income entry`)
- Open entry form
- Fill amount, type, date, note
- Submit and verify form closes
- Entry appears in forecast

### 4. **Recurring Entry** (`should create a recurring weekly entry`)
- Create recurring expense
- Set frequency (weekly)
- Set start date
- Verify recurring badge appears

### 5. **Day Expansion** (`should expand and collapse day details`)
- Click day row to expand
- View individual entries
- Collapse back to summary

### 6. **Calendar Navigation** (`should navigate calendar months`)
- Click next/previous month buttons
- Verify month changes
- Navigate back and forth

### 7. **Calendar Date Selection** (`should select date from calendar`)
- Click date in calendar grid
- Verify selection (aria-selected)
- Date highlighted

### 8. **Entry Deletion** (`should delete an entry with confirmation`)
- Create test entry
- Click delete button
- Confirm dialog
- Entry removed

### 9. **Error Handling** (`should handle errors gracefully`)
- Submit empty form
- Verify validation errors appear
- Error messages displayed

### 10. **Loading States** (`should show loading state during operations`)
- Create entry
- Observe loading indicators
- Verify completion

### 11. **Forecast Display** (`should display forecast for 30 days`)
- Verify forecast loads
- Check day count (20-31 days)
- All days rendered

## Test Architecture

- **Framework**: Playwright Test
- **Browser**: Chromium (Desktop Chrome profile)
- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Auto-start**: Playwright config starts dev server automatically
- **Retries**: 0 locally, 2 in CI
- **Parallelization**: Full parallel execution enabled
- **Trace**: Recorded on first retry for debugging

## Expected Results

All tests should pass with a clean database. Example output:

```
Running 11 tests using 1 worker

✓ Budget Forecast App › should display the app title and initial state (1.2s)
✓ Budget Forecast App › should update balance anchor (1.5s)
✓ Budget Forecast App › should create a one-time income entry (2.1s)
✓ Budget Forecast App › should create a recurring weekly entry (2.3s)
✓ Budget Forecast App › should expand and collapse day details (1.8s)
✓ Budget Forecast App › should navigate calendar months (1.4s)
✓ Budget Forecast App › should select date from calendar (1.6s)
✓ Budget Forecast App › should delete an entry with confirmation (2.5s)
✓ Budget Forecast App › should handle errors gracefully (1.9s)
✓ Budget Forecast App › should show loading state during operations (2.0s)
✓ Budget Forecast App › should display forecast for 30 days (1.3s)

11 passed (19.6s)
```

## Troubleshooting

### Test Failures

**Database connection errors:**
- Verify `DATABASE_URL` in `/server/.env`
- Ensure migrations ran successfully
- Check Neon dashboard for database status

**Element not found errors:**
- Check if app is rendering correctly in manual testing
- Verify selectors match current UI (role, label, text)
- Use `yarn test:e2e:headed` to watch test execution

**Timeout errors:**
- Increase timeout in specific test if operation is slow
- Check network tab for failed API requests
- Verify server logs for backend errors

### Debugging Failed Tests

1. **Run in UI mode**: `yarn test:e2e:ui`
   - Use time-travel debugging
   - Inspect DOM at each step
   - View network requests

2. **Check trace files**: After retry, traces saved to `test-results/`
   - Open with `npx playwright show-trace <trace-file>`
   - View screenshots, network, console logs

3. **Add debug points**: Insert `await page.pause()` in test
   - Test pauses at that line
   - Inspect page state manually
   - Step through remaining actions

## CI/CD Integration

Add to your CI pipeline (GitHub Actions example):

```yaml
- name: Install dependencies
  run: yarn install

- name: Install Playwright Browsers
  run: cd client && npx playwright install --with-deps chromium

- name: Run E2E tests
  run: yarn test:e2e
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: client/playwright-report/
```

## Extending Tests

To add new tests:

1. Add new `test()` block to `budget-forecast.spec.ts`
2. Use existing patterns (page selectors, waits, assertions)
3. Follow naming convention: `should [expected behavior]`
4. Keep tests independent (no shared state between tests)
5. Use `test.beforeEach()` for common setup

Example:
```typescript
test('should edit an existing entry', async ({ page }) => {
  // Create entry
  // Click edit button
  // Modify fields
  // Save changes
  // Verify updates appear
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Selector Guide](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)
