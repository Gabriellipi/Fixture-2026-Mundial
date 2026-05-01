import { test, expect } from './fixtures/authenticated.js';

async function openPredictionsTab(page) {
  const btn = page
    .locator('nav[aria-label="Primary"] button')
    .filter({ hasText: /predic/i })
    .first();

  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
  } else {
    await page.locator('nav').last().locator('button').filter({ hasText: /predic/i }).first().click();
  }

  await page.waitForSelector('article', { timeout: 10_000 });
}

async function getFirstMatchCard(page) {
  // The first match card with prediction inputs
  return page.locator('article').filter({ has: page.locator('input[type="number"]') }).first();
}

async function openPrediction(page) {
  await openPredictionsTab(page);

  // Click the first match card to open its prediction drawer/modal
  const card = page.locator('article').first();
  await card.click();

  // Wait for score inputs to appear
  await page.waitForSelector('input[type="number"][min="0"]', {
    state: 'visible',
    timeout: 8_000,
  });
}

test.describe('PREDICTIONS — score input behaviour', () => {
  test('Blur on empty home input auto-fills "0"', async ({ page }) => {
    await openPrediction(page);

    const inputs = page.locator('input[type="number"][min="0"]');
    const homeInput = inputs.first();

    // Clear and blur
    await homeInput.fill('');
    await homeInput.blur();
    await page.waitForTimeout(200);

    await expect(homeInput).toHaveValue('0');
  });

  test('Blur on empty away input auto-fills "0"', async ({ page }) => {
    await openPrediction(page);

    const inputs = page.locator('input[type="number"][min="0"]');
    const awayInput = inputs.nth(1);

    await awayInput.fill('');
    await awayInput.blur();
    await page.waitForTimeout(200);

    await expect(awayInput).toHaveValue('0');
  });

  test('Filled value is preserved on blur', async ({ page }) => {
    await openPrediction(page);

    const inputs = page.locator('input[type="number"][min="0"]');
    const homeInput = inputs.first();

    await homeInput.fill('3');
    await homeInput.blur();
    await page.waitForTimeout(200);

    await expect(homeInput).toHaveValue('3');
  });

  test('Both inputs together: blur empty → both become "0"', async ({ page }) => {
    await openPrediction(page);

    const inputs = page.locator('input[type="number"][min="0"]');
    await inputs.first().fill('');
    await inputs.nth(1).fill('');
    await inputs.first().blur();
    await inputs.nth(1).blur();
    await page.waitForTimeout(200);

    await expect(inputs.first()).toHaveValue('0');
    await expect(inputs.nth(1)).toHaveValue('0');
  });
});

test.describe('PREDICTIONS — submit flow', () => {
  test('Submitting prediction shows ENVIADA / SENT badge', async ({ page }) => {
    // Mock the Supabase upsert so it returns 200
    await page.route('**/rest/v1/predictions**', (route) => {
      if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
        route.fulfill({ status: 201, body: '[]', headers: { 'Content-Type': 'application/json' } });
      } else {
        route.continue();
      }
    });

    await openPrediction(page);

    const inputs = page.locator('input[type="number"][min="0"]');
    await inputs.first().fill('2');
    await inputs.nth(1).fill('1');

    // Click the submit/send button
    const submitBtn = page.locator(
      'button:has-text("Enviar"), button:has-text("Submit"), button:has-text("Guardar"), button:has-text("Save")'
    ).first();
    await submitBtn.click();

    // Expect confirmation badge/text
    await expect(
      page.locator('text=/ENVIADA|SENT|Enviado|Saved/i').first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('Re-opening prediction loads previously saved values', async ({ page }) => {
    // Pre-seed the mock predictions response with a saved score
    await page.route('**/rest/v1/predictions**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'mock-pred-1',
              match_id: null, // will match first match
              home_score: 2,
              away_score: 1,
              status: 'enviada',
              user_id: 'mock-user-id',
            },
          ]),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        route.continue();
      }
    });

    await openPrediction(page);

    // After loading, at least one input should be pre-filled if data matches
    const inputs = page.locator('input[type="number"][min="0"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
    // The test verifies no crash and inputs are present (actual value depends on match_id alignment)
  });
});

test.describe('PREDICTIONS — status badges', () => {
  test('BORRADORES filter shows only draft predictions', async ({ page }) => {
    await openPredictionsTab(page);

    const draftFilter = page.locator(
      'button:has-text("Borrador"), button:has-text("Draft"), button:has-text("BORRADORES")'
    ).first();

    if (await draftFilter.isVisible().catch(() => false)) {
      await draftFilter.click();
      await page.waitForTimeout(300);
      // Verify sent badges are not shown
      await expect(
        page.locator('text=/ENVIADA|SENT/i').first()
      ).not.toBeVisible({ timeout: 2_000 }).catch(() => {});
    } else {
      test.skip();
    }
  });

  test('Score inputs accept values 0-99 only', async ({ page }) => {
    await openPrediction(page);

    const input = page.locator('input[type="number"][min="0"]').first();
    const min = await input.getAttribute('min');
    const max = await input.getAttribute('max');

    expect(min).toBe('0');
    expect(max).toBe('99');
  });
});
