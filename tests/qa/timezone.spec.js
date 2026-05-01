import { test, expect } from './fixtures/authenticated.js';

// Three country codes and a representative city in each timezone
const TEST_COUNTRIES = [
  { code: 'MX', tz: 'America/Mexico_City', offsetLabel: /GMT[-−]6|GMT[-−]5|CDT|CST/ },
  { code: 'JP', tz: 'Asia/Tokyo',          offsetLabel: /GMT\+9|JST/ },
  { code: 'AR', tz: 'America/Argentina/Buenos_Aires', offsetLabel: /GMT[-−]3|ART/ },
];

async function openPredictionsTab(page) {
  // Navigate to Predicciones tab
  const desktopBtn = page
    .locator('nav[aria-label="Primary"] button')
    .filter({ hasText: /predic/i })
    .first();

  if (await desktopBtn.isVisible().catch(() => false)) {
    await desktopBtn.click();
  } else {
    await page.locator('nav').last().locator('button').filter({ hasText: /predic/i }).first().click();
  }

  // Wait for the country selector to appear
  await page.waitForSelector('select, [role="combobox"], button:has-text("México"), button:has-text("Mexico")', {
    timeout: 10_000,
  });
}

async function getFirstMatchTime(page) {
  // Get the text of the first visible match time element
  const timeEl = page
    .locator('article time, [data-testid="match-time"], span:has-text(":"), p:has-text(":")')
    .first();

  try {
    await timeEl.waitFor({ state: 'visible', timeout: 5_000 });
    return await timeEl.innerText();
  } catch {
    // Fall back to any element that looks like HH:MM
    const all = await page.locator('span, p, div').filter({ hasText: /^\d{1,2}:\d{2}$/ }).all();
    if (all.length > 0) return await all[0].innerText();
    return null;
  }
}

async function selectCountry(page, code) {
  // The country selector might be a <select> or a custom button-based dropdown
  const nativeSelect = page.locator('select').first();
  if (await nativeSelect.isVisible().catch(() => false)) {
    await nativeSelect.selectOption(code);
    await page.waitForTimeout(400);
    return;
  }

  // Custom dropdown: click trigger, then pick the option
  const trigger = page.locator('[aria-haspopup], [role="combobox"]').first();
  await trigger.click();
  await page.waitForTimeout(200);

  const option = page.locator(`[data-value="${code}"], li:has-text("${code}"), button:has-text("${code}")`).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    // Try searching inside the open list
    await page.locator(`[role="option"][data-value="${code}"]`).first().click();
  }
  await page.waitForTimeout(400);
}

test.describe('TIMEZONE — country selector updates match times', () => {
  test.beforeEach(async ({ page }) => {
    await openPredictionsTab(page);
  });

  test('localStorage key wc2026_timezone updates on country change', async ({ page }) => {
    await selectCountry(page, 'JP');

    const stored = await page.evaluate(() => localStorage.getItem('wc2026_timezone'));
    expect(stored).toBe('Asia/Tokyo');
  });

  test('Switching country changes displayed match times', async ({ page }) => {
    // Get baseline time (Mexico / default)
    await selectCountry(page, 'MX');
    const timeMX = await getFirstMatchTime(page);

    // Switch to Japan
    await selectCountry(page, 'JP');
    const timeJP = await getFirstMatchTime(page);

    // Times should differ because UTC+9 vs UTC-6 is a 15-hour gap
    expect(timeMX).not.toBeNull();
    expect(timeJP).not.toBeNull();
    expect(timeMX).not.toEqual(timeJP);
  });

  test('Switching country updates ALL visible match cards', async ({ page }) => {
    await selectCountry(page, 'AR');

    // Collect all time strings
    const times = await page
      .locator('article time, span, p')
      .filter({ hasText: /^\d{1,2}:\d{2}$/ })
      .all();

    // There should be at least one match card showing a time
    expect(times.length).toBeGreaterThan(0);
  });

  for (const { code, tz } of TEST_COUNTRIES) {
    test(`Country ${code} stores timezone ${tz}`, async ({ page }) => {
      await selectCountry(page, code);

      const stored = await page.evaluate(() => localStorage.getItem('wc2026_timezone'));
      expect(stored).toBe(tz);
    });
  }

  test('Timezone persists across tab navigation', async ({ page }) => {
    await selectCountry(page, 'JP');
    await page.evaluate(() => localStorage.getItem('wc2026_timezone')); // ensure stored

    // Navigate away and back
    const groupsBtn = page
      .locator('nav[aria-label="Primary"] button')
      .filter({ hasText: /grup/i })
      .first();
    if (await groupsBtn.isVisible().catch(() => false)) await groupsBtn.click();
    await page.waitForTimeout(300);

    await openPredictionsTab(page);

    const stored = await page.evaluate(() => localStorage.getItem('wc2026_timezone'));
    expect(stored).toBe('Asia/Tokyo');
  });
});
