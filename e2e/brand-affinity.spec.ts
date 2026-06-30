import { test, expect } from '@playwright/test';

test.describe('Brand Affinity Feature', () => {
  test('renders chips on detail page', async ({ page }) => {
    // Visit cristiano profile detail page
    await page.goto('/profile/cristiano');

    // Check that Brand Affinities section and Nike chip are visible
    await expect(page.getByText('Brand Affinities')).toBeVisible();
    await expect(page.locator('span').filter({ hasText: /^Nike$/ })).toBeVisible();
  });
});
