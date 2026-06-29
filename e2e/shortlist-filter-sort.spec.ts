import { test, expect } from '@playwright/test';

test('shortlist filter by platform and sort by followers', async ({ page }) => {
  await page.goto('/');

  // 1. Search and navigate to Instagram profile (@cristiano)
  const searchInput = page.getByPlaceholder('Search by username or name…');
  await searchInput.fill('cristiano');
  await page.getByText('@cristiano').first().click();
  await expect(page).toHaveURL(/.*\/profile\/cristiano.*/);

  // Add @cristiano to shortlist
  await page.getByRole('button', { name: 'Add to shortlist' }).click();
  await expect(page.getByRole('button', { name: 'Added to shortlist' })).toBeVisible();

  // Return to home
  await page.goto('/');

  // 2. Switch to YouTube platform, search and navigate to @mrbeast
  const mainTablist = page.getByRole('tablist', { name: 'Filter by platform' });
  await mainTablist.getByRole('tab', { name: 'YouTube' }).click();
  await searchInput.fill('mrbeast');
  await page.getByText('@MrBeast6000').first().click();
  await expect(page).toHaveURL(/.*\/profile\/MrBeast6000.*/i);

  // Add @mrbeast to shortlist
  await page.getByRole('button', { name: 'Add to shortlist' }).click();
  await expect(page.getByRole('button', { name: 'Added to shortlist' })).toBeVisible();

  // 3. Open shortlist panel
  await page.getByRole('button', { name: /Open shortlist/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Shortlisted profiles' });
  await expect(dialog.getByText('@cristiano')).toBeVisible();
  await expect(dialog.getByText('@MrBeast6000')).toBeVisible();

  // 4. Filter shortlist by YouTube
  const shortlistTablist = dialog.getByRole('tablist', { name: 'Filter shortlist by platform' });
  await shortlistTablist.getByRole('tab', { name: 'YouTube' }).click();
  await expect(dialog.getByText('@MrBeast6000')).toBeVisible();
  await expect(dialog.getByText('@cristiano')).toBeHidden();
  await expect(dialog.getByText('Drag-to-reorder is disabled while sorting or filtering is active.')).toBeVisible();

  // 5. Reset filter to All
  await shortlistTablist.getByRole('tab', { name: 'All' }).click();
  await expect(dialog.getByText('@cristiano')).toBeVisible();
  await expect(dialog.getByText('@MrBeast6000')).toBeVisible();

  // 6. Sort by followers
  const sortSelect = dialog.getByRole('combobox', { name: 'Sort shortlist' });
  await sortSelect.selectOption('followers');
  await expect(dialog.getByText('Drag-to-reorder is disabled while sorting or filtering is active.')).toBeVisible();
});
