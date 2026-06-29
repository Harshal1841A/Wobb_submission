import { test, expect } from '@playwright/test';

test('search -> add to shortlist -> reload -> assert profile persists', async ({ page }) => {
  // 1. Navigate to the app
  await page.goto('/');

  // 2. Search for a profile
  const searchInput = page.getByPlaceholder('Search by username or name…');
  await searchInput.fill('cristiano');

  // Navigate to profile details
  await page.getByText('@cristiano').first().click();
  await expect(page).toHaveURL(/.*\/profile\/cristiano.*/);

  // 3. Add the profile to the shortlist
  const addButton = page.getByRole('button', { name: 'Add to shortlist' });
  await addButton.click();

  // Verify button changes state
  await expect(page.getByRole('button', { name: 'Added to shortlist' })).toBeVisible();

  // 4. Open the shortlist drawer
  const shortlistHeaderButton = page.getByRole('button', { name: /Open shortlist/ });
  await shortlistHeaderButton.click();

  // Assert profile is visible in drawer
  const dialog = page.getByRole('dialog', { name: 'Shortlisted profiles' });
  await expect(dialog.getByText('@cristiano')).toBeVisible();

  // 5. Reload the page to verify persistence
  await page.reload();

  // 6. Open the shortlist drawer again after reload
  await shortlistHeaderButton.click();
  await expect(page.getByRole('dialog', { name: 'Shortlisted profiles' }).getByText('@cristiano')).toBeVisible();
});
