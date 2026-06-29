import { test, expect } from '@playwright/test';

test.describe('Brand Affinity Feature', () => {
  test('renders chips on detail page and filters on search page', async ({ page }) => {
    // Visit cristiano profile detail page
    await page.goto('/profile/cristiano');

    // Check that Brand Affinities section and Nike chip are visible
    await expect(page.getByText('Brand Affinities')).toBeVisible();
    await expect(page.getByText('Nike')).toBeVisible();

    // Navigate to search page
    await page.goto('/');

    // Check that select dropdown filter is visible
    const select = page.locator('#brand-affinity-filter');
    await expect(select).toBeVisible();

    // Select Nike
    await select.selectOption('Nike');

    // Assert only Cristiano Ronaldo is displayed
    await expect(page.getByText('@cristiano')).toBeVisible();
    await expect(page.getByText('@instagram')).not.toBeVisible();
  });
});
