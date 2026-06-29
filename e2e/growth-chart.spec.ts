import { test, expect } from '@playwright/test';

test.describe('Growth Chart Feature', () => {
  test('renders follower growth chart and toggles avg likes comparison', async ({ page }) => {
    // Visit cristiano profile detail page
    await page.goto('/profile/cristiano');

    // Check that chart title is visible
    await expect(page.getByText('Follower Growth & Trend')).toBeVisible();

    // Check that Compare Avg Likes checkbox exists and toggle it
    const compareCheckbox = page.getByLabel('Compare Avg Likes');
    await expect(compareCheckbox).toBeVisible();
    await expect(compareCheckbox).not.toBeChecked();

    await compareCheckbox.check();
    await expect(compareCheckbox).toBeChecked();
  });
});
