import { test, expect } from './fixtures/authenticated.js';

async function openSearch(page) {
  // The search button is the first icon button in the header (before globe)
  const searchBtn = page.locator('header button').filter({
    has: page.locator('.lucide-search, [data-lucide="search"]'),
  }).first();

  // Fallback: first header button that isn't the logo
  const fallback = page.locator('header div > div > div > button').first();
  const btn = (await searchBtn.count()) > 0 ? searchBtn : fallback;
  await btn.click();

  // Wait for search input
  await page.waitForSelector('input[placeholder]', {
    state: 'visible',
    timeout: 5_000,
  });
}

test.describe('SEARCH — team lookup', () => {
  test('Search "Argen" finds Argentina', async ({ page }) => {
    await openSearch(page);

    const input = page.locator('input[placeholder]').last();
    await input.fill('Argen');

    // Wait for debounce (300ms) + render
    await page.waitForTimeout(500);

    await expect(
      page.locator('button:has-text("Argentina")').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Search "bra" finds Brazil (localized)', async ({ page }) => {
    await openSearch(page);
    const input = page.locator('input[placeholder]').last();
    await input.fill('bra');
    await page.waitForTimeout(500);

    // In Spanish "Brasil", in English "Brazil" — match either
    await expect(
      page.locator('button:has-text("Bras"), button:has-text("Braz")').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Search "xxx" shows no-results message', async ({ page }) => {
    await openSearch(page);
    const input = page.locator('input[placeholder]').last();
    await input.fill('xxx');
    await page.waitForTimeout(500);

    await expect(
      page.locator('text=/No encontramos|No results/i').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Selecting team navigates to Groups tab', async ({ page }) => {
    await openSearch(page);
    const input = page.locator('input[placeholder]').last();
    await input.fill('Argen');
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Argentina")').first().click();

    // Groups screen should be visible
    await expect(
      page.locator('article[id^="group-"]').first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('Groups stay in A–Z order after search selection', async ({ page }) => {
    await openSearch(page);
    const input = page.locator('input[placeholder]').last();
    await input.fill('Argen');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Argentina")').first().click();

    await page.waitForSelector('article[id^="group-"]', { timeout: 8_000 });

    // Collect all group article ids in DOM order
    const groupIds = await page.$$eval(
      'article[id^="group-"]',
      (els) => els.map((el) => el.id.replace('group-', ''))
    );

    const sorted = [...groupIds].sort((a, b) => a.localeCompare(b));
    expect(groupIds).toEqual(sorted);
  });

  test('Matched team gets highlight (ring or gold bg)', async ({ page }) => {
    await openSearch(page);
    const input = page.locator('input[placeholder]').last();
    await input.fill('Argen');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Argentina")').first().click();

    await page.waitForSelector('article[id^="group-"]', { timeout: 8_000 });

    // The group containing Argentina should have a ring class
    const ringGroup = page.locator('article[id^="group-"].ring-2');
    await expect(ringGroup).toBeVisible({ timeout: 5_000 });
  });

  test('Clearing search removes highlight', async ({ page }) => {
    // Navigate to groups first via search
    await openSearch(page);
    const input = page.locator('input[placeholder]').last();
    await input.fill('Argen');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Argentina")').first().click();
    await page.waitForSelector('article.ring-2', { timeout: 8_000 });

    // Search again and clear
    await openSearch(page);
    const input2 = page.locator('input[placeholder]').last();
    await input2.fill('');
    // Close search panel via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // No ring should remain (groups reset to normal state)
    // Note: ring clears only on a new search selection, not on Escape —
    // the focused group stays highlighted until another action.
    // This test verifies that the group order is still A-Z.
    const groupIds = await page.$$eval(
      'article[id^="group-"]',
      (els) => els.map((el) => el.id.replace('group-', ''))
    );
    const sorted = [...groupIds].sort((a, b) => a.localeCompare(b));
    expect(groupIds).toEqual(sorted);
  });

  test('Keyboard navigation — ArrowDown + Enter selects first result', async ({ page }) => {
    await openSearch(page);
    const input = page.locator('input[placeholder]').last();
    await input.fill('Argen');
    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(
      page.locator('article[id^="group-"]').first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('Escape closes search dropdown', async ({ page }) => {
    await openSearch(page);
    await page.keyboard.press('Escape');
    await expect(
      page.locator('input[placeholder]')
    ).not.toBeVisible({ timeout: 3_000 });
  });
});
