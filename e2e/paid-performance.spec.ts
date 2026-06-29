import { test, expect } from '@playwright/test';

test.describe('Paid Post Performance Feature', () => {
  test('displays paid signal card on profile detail page', async ({ page }) => {
    // Visit cristiano profile detail page (cristiano has paid_post_performance: 0.542469)
    await page.goto('/profile/cristiano');

    // Check that Paid signal card is visible
    await expect(page.getByText('Paid signal')).toBeVisible();
    await expect(page.getByText('PRO', { exact: true })).toBeVisible();
    await expect(page.getByText('Underperforms organic')).toBeVisible();
  });
});
