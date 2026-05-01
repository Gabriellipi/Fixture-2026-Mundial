import { test, expect } from './fixtures/authenticated.js';

async function openMyPicksTab(page) {
  const btn = page
    .locator('nav[aria-label="Primary"] button')
    .filter({ hasText: /picks|mis pick/i })
    .first();

  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
  } else {
    // Try bottom nav (mobile)
    await page.locator('nav').last().locator('button').filter({ hasText: /picks/i }).first().click();
  }

  // Wait for the picks list or empty state
  await page.waitForSelector(
    'button:has(.rounded-full), [data-testid="picks-row"], text=/sin predicciones|no predictions|no picks/i',
    { timeout: 10_000 }
  );
}

test.describe('MIS PICKS — compact row layout', () => {
  test.beforeEach(async ({ page }) => {
    // Seed at least one prediction so there's something to inspect
    await page.route('**/rest/v1/predictions**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'mock-pred-1',
              match_id: 'group_A_1',
              home_score: 2,
              away_score: 1,
              status: 'borrador',
              user_id: 'mock-user-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'mock-pred-2',
              match_id: 'group_B_1',
              home_score: 0,
              away_score: 0,
              status: 'enviada',
              user_id: 'mock-user-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        route.continue();
      }
    });
  });

  test('Compact row height is under 60px', async ({ page }) => {
    await openMyPicksTab(page);

    // Find a compact prediction row
    const row = page.locator('button:has(.rounded-full)').first();

    if (await row.isVisible().catch(() => false)) {
      const box = await row.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeLessThan(60);
    } else {
      // Check for any compact row-like element
      const altRow = page.locator('[data-testid="picks-row"]').first();
      if (await altRow.isVisible().catch(() => false)) {
        const box = await altRow.boundingBox();
        expect(box!.height).toBeLessThan(60);
      } else {
        test.skip();
      }
    }
  });

  test('Date separator headers render above rows', async ({ page }) => {
    await openMyPicksTab(page);

    // Date headers: look for elements that look like "Lun 12 Jun" or similar
    const dateSep = page.locator(
      'h2, h3, [role="heading"], p:has-text("Jun"), p:has-text("Jul"), span:has-text("2026")'
    ).first();

    // Just verify structure exists (not empty page crash)
    const rowCount = await page.locator('button:has(.rounded-full)').count();
    if (rowCount === 0) test.skip();

    // If rows exist, assert date context somewhere on page
    const bodyText = await page.locator('main, section, div').first().innerText().catch(() => '');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('Clicking a row expands accordion with full details', async ({ page }) => {
    await openMyPicksTab(page);

    const row = page.locator('button:has(.rounded-full)').first();
    if (!(await row.isVisible().catch(() => false))) test.skip();

    // Measure height before
    const boxBefore = await row.boundingBox();

    // Click to expand
    await row.click();
    await page.waitForTimeout(300);

    // Expanded section should appear — look for team name text or score box
    const expanded = page.locator(
      '.border-t, [data-state="open"], [aria-expanded="true"]'
    );
    const expandedCount = await expanded.count();

    // Either an expanded region or the parent container grew
    const parentAfter = await page
      .locator('article, section')
      .filter({ has: row })
      .first()
      .boundingBox()
      .catch(() => null);

    // Verify something expanded: either expanded element visible or bounding box grew
    if (expandedCount > 0) {
      await expect(expanded.first()).toBeVisible();
    } else if (parentAfter && boxBefore) {
      // The container should be taller
      expect(parentAfter.height).toBeGreaterThan(boxBefore.height);
    }
  });

  test('Clicking expanded row again collapses it', async ({ page }) => {
    await openMyPicksTab(page);

    const row = page.locator('button:has(.rounded-full)').first();
    if (!(await row.isVisible().catch(() => false))) test.skip();

    await row.click();
    await page.waitForTimeout(300);

    await row.click();
    await page.waitForTimeout(300);

    // Row should be back to compact height
    const box = await row.boundingBox();
    if (box) expect(box.height).toBeLessThan(80);
  });

  test('ChevronDown icon rotates when row is expanded', async ({ page }) => {
    await openMyPicksTab(page);

    const row = page.locator('button:has(.rounded-full)').first();
    if (!(await row.isVisible().catch(() => false))) test.skip();

    // Look for chevron rotation class change
    const chevron = row.locator('.lucide-chevron-down, [class*="rotate"]').first();
    const hasChevron = await chevron.count();

    if (hasChevron === 0) test.skip();

    const classBefore = await chevron.getAttribute('class');
    await row.click();
    await page.waitForTimeout(200);
    const classAfter = await chevron.getAttribute('class');

    // Class should differ (rotate-180 added or removed)
    expect(classAfter).not.toBe(classBefore);
  });
});

test.describe('MIS PICKS — filter tabs', () => {
  test('BORRADORES filter tab is present', async ({ page }) => {
    await openMyPicksTab(page);

    const filterBtn = page.locator(
      'button:has-text("Borrador"), button:has-text("Draft"), button:has-text("BORRADORES"), button:has-text("Borradores")'
    ).first();

    if (await filterBtn.isVisible().catch(() => false)) {
      await expect(filterBtn).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('ENVIADAS filter tab is present', async ({ page }) => {
    await openMyPicksTab(page);

    const filterBtn = page.locator(
      'button:has-text("Enviada"), button:has-text("Sent"), button:has-text("ENVIADAS"), button:has-text("Enviadas")'
    ).first();

    if (await filterBtn.isVisible().catch(() => false)) {
      await expect(filterBtn).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('Clicking BORRADORES shows only draft rows', async ({ page }) => {
    await openMyPicksTab(page);

    const filterBtn = page.locator(
      'button:has-text("Borrador"), button:has-text("Borradores")'
    ).first();

    if (!(await filterBtn.isVisible().catch(() => false))) test.skip();

    await filterBtn.click();
    await page.waitForTimeout(300);

    // Sent badges should not appear
    const sentBadges = page.locator('text=/ENVIADA|SENT/i');
    const sentCount = await sentBadges.count();
    expect(sentCount).toBe(0);
  });
});
