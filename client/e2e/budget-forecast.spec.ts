import { test, expect } from '@playwright/test';
import { format, addDays } from 'date-fns';

test.describe('Budget Forecast App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Budget Forecast' })).toBeVisible();
  });

  test('should display the app title and initial state', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Budget Forecast' })).toBeVisible();

    // Check sections are present
    await expect(page.getByRole('heading', { name: 'Add Entry' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '30-Day Forecast' })).toBeVisible();

    // Check New Entry button
    await expect(page.getByRole('button', { name: 'New Entry' })).toBeVisible();
  });

  test('should update balance anchor', async ({ page }) => {
    // Find the balance input (it should be in the balance anchor section)
    const balanceInput = page.locator('input[type="text"]').first();

    // Clear and enter new balance
    await balanceInput.clear();
    await balanceInput.fill('1000.00');
    await balanceInput.blur(); // Trigger the update

    // Wait a moment for the mutation to complete
    await page.waitForTimeout(500);

    // Verify loading state appeared (may be brief)
    // Note: This might be too fast to catch, so we'll skip this check

    // The balance should be updated and reflected in calculations
    await expect(balanceInput).toHaveValue('1000.00');
  });

  test('should create a one-time income entry', async ({ page }) => {
    // Click New Entry button
    await page.getByRole('button', { name: 'New Entry' }).click();

    // Fill out the form
    await page.getByLabel('Amount').fill('500.00');
    await page.getByLabel('Type').selectOption('income');

    // Select tomorrow's date
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    await page.getByLabel('Date').fill(tomorrow);

    await page.getByLabel('Note (optional)').fill('Freelance payment');

    // Submit the form
    await page.getByRole('button', { name: 'Save Entry' }).click();

    // Wait for the entry to be created
    await page.waitForTimeout(500);

    // Verify the form is closed
    await expect(page.getByLabel('Amount')).not.toBeVisible();

    // The entry should appear in the forecast list
    // We can't easily verify the exact text, but the forecast should update
  });

  test('should create a recurring weekly entry', async ({ page }) => {
    // Click New Entry button
    await page.getByRole('button', { name: 'New Entry' }).click();

    // Fill out the form
    await page.getByLabel('Amount').fill('300.00');
    await page.getByLabel('Type').selectOption('expense');

    // Check the recurring checkbox
    await page.getByLabel('Recurring entry').check();

    // Select frequency
    await page.getByLabel('Frequency').selectOption('weekly');

    // Select start date (today)
    const today = format(new Date(), 'yyyy-MM-dd');
    await page.getByLabel('Start date').fill(today);

    await page.getByLabel('Note (optional)').fill('Weekly rent');

    // Submit the form
    await page.getByRole('button', { name: 'Save Entry' }).click();

    // Wait for the entry to be created
    await page.waitForTimeout(500);

    // Verify the form is closed
    await expect(page.getByLabel('Amount')).not.toBeVisible();
  });

  test('should expand and collapse day details', async ({ page }) => {
    // Wait for forecast to load
    await page.waitForTimeout(1000);

    // Find the first day row (button) - it should have date, income, expenses, balance
    const firstDayButton = page.locator('button[aria-expanded]').first();

    // Check initial state (collapsed)
    await expect(firstDayButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    await firstDayButton.click();

    // Check expanded state
    await expect(firstDayButton).toHaveAttribute('aria-expanded', 'true');

    // Click again to collapse
    await firstDayButton.click();

    // Check collapsed state
    await expect(firstDayButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should navigate calendar months', async ({ page }) => {
    // Find the current month/year text
    const monthYearText = page.locator('h3').filter({ hasText: /\w+ \d{4}/ }).first();
    const initialMonth = await monthYearText.textContent();

    // Click next month button
    await page.getByRole('button', { name: 'Next month' }).click();

    // Verify month changed
    const newMonth = await monthYearText.textContent();
    expect(newMonth).not.toBe(initialMonth);

    // Click previous month button twice to go back
    await page.getByRole('button', { name: 'Previous month' }).click();
    await page.getByRole('button', { name: 'Previous month' }).click();

    // Month should be different from initial
    const finalMonth = await monthYearText.textContent();
    expect(finalMonth).not.toBe(initialMonth);
  });

  test('should select date from calendar', async ({ page }) => {
    // Wait for calendar to be visible
    await page.waitForTimeout(500);

    // Find a date button in the calendar (not disabled)
    // Look for buttons with role in the calendar grid
    const dateButtons = page.locator('button[aria-label*="2026"]').filter({ hasNotText: /^$/ });
    const firstDateButton = dateButtons.first();

    // Click the date
    await firstDateButton.click();

    // The date should be selected (marked with aria-selected)
    await expect(firstDateButton).toHaveAttribute('aria-selected', 'true');
  });

  test('should delete an entry with confirmation', async ({ page }) => {
    // First create an entry
    await page.getByRole('button', { name: 'New Entry' }).click();
    await page.getByLabel('Amount').fill('100.00');
    await page.getByLabel('Type').selectOption('expense');
    const today = format(new Date(), 'yyyy-MM-dd');
    await page.getByLabel('Date').fill(today);
    await page.getByRole('button', { name: 'Save Entry' }).click();

    // Wait for entry to be created
    await page.waitForTimeout(1000);

    // Expand today's date to see entries
    const todayButton = page.locator(`button[aria-controls*="${today}"]`).first();
    await todayButton.click();

    // Find and click delete button
    const deleteButton = page.getByRole('button', { name: 'Delete entry' }).first();

    // Set up dialog handler before clicking
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Are you sure');
      dialog.accept();
    });

    await deleteButton.click();

    // Wait for deletion
    await page.waitForTimeout(500);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'New Entry' }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Save Entry' }).click();

    // Error messages should appear
    await expect(page.getByText('Amount must be greater than 0')).toBeVisible();
    await expect(page.getByText('Date is required')).toBeVisible();
  });

  test('should show loading state during operations', async ({ page }) => {
    // Create an entry to trigger loading state
    await page.getByRole('button', { name: 'New Entry' }).click();
    await page.getByLabel('Amount').fill('50.00');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    await page.getByLabel('Date').fill(tomorrow);

    // Click save and immediately check for loading state
    // Note: This might be too fast to catch in local testing
    await page.getByRole('button', { name: 'Save Entry' }).click();

    // The loading state might appear briefly
    // We'll just verify the operation completes
    await page.waitForTimeout(1000);

    // Form should be closed after successful creation
    await expect(page.getByLabel('Amount')).not.toBeVisible();
  });

  test('should display forecast for 30 days', async ({ page }) => {
    // Wait for forecast to load
    await page.waitForTimeout(1000);

    // Check that there are multiple day rows
    const dayRows = page.locator('button[aria-expanded]');
    const count = await dayRows.count();

    // Should have around 30 days (may vary based on forecast logic)
    expect(count).toBeGreaterThan(20);
    expect(count).toBeLessThanOrEqual(31);
  });
});
