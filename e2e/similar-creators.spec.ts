import { test, expect } from '@playwright/test';

test.describe('Similar Creators Rail Feature', () => {
  test('displays rail and navigates to similar profile', async ({ page }) => {
    // Visit cristiano profile detail page
    await page.goto('/profile/cristiano');

    // Check that Similar Creators heading is visible
    await expect(page.getByText('Similar Creators')).toBeVisible();

    // Check that one of the similar users (e.g. @nikefootball or @nike) is visible
    await expect(page.getByText('@nikefootball')).toBeVisible();

    // Click @nikefootball card
    await page.getByText('@nikefootball').click();

    // Assert URL navigated to /profile/nikefootball
    await expect(page).toHaveURL(/\/profile\/nikefootball/);

    // Since nikefootball doesn't have a detail file, check fallback message
    await expect(page.getByText('Could not load profile details for @nikefootball')).toBeVisible();
  });
});
