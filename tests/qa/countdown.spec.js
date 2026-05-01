import { test, expect } from './fixtures/authenticated.js';

const THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Inject a fake match starting in `minutesFromNow` minutes into the page.
 * We do this by overriding Date.now() so that the app's countdown logic
 * believes time is shifted, making real fixtures appear as "near kickoff".
 *
 * Strategy: shift Date.now() backward so the nearest real fixture is within
 * the threshold — OR inject a synthetic match by mocking the fixture data.
 *
 * Since we can't easily mock fixture data without knowing the exact Supabase
 * response schema, we use Date.now() mocking — simpler and non-invasive.
 */
async function shiftClockToNearKickoff(page, targetMatchTimeISO, shiftMinutes = 25) {
  // Find the kickoff timestamp and shift Date.now() to be `shiftMinutes` before it
  await page.addInitScript(
    ({ iso, shift }) => {
      const kickoff = new Date(iso).getTime();
      const fakeNow = kickoff - shift * 60 * 1000;
      const delta = fakeNow - Date.now();
      const _DateNow = Date.now.bind(Date);
      Date.now = () => _DateNow() + delta;
      // Also shift new Date() with no args
      const _Date = Date;
      globalThis.Date = class extends _Date {
        constructor(...args) {
          if (args.length === 0) super(_DateNow() + delta);
          else super(...args);
        }
        static now() { return _DateNow() + delta; }
      };
    },
    { iso: targetMatchTimeISO, shift: shiftMinutes }
  );
}

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

test.describe('COUNTDOWN — PRÓXIMO badge and MM:SS timer', () => {
  test('PRÓXIMO badge appears when match is ≤30 min away', async ({ page }) => {
    // Use a future date that will definitely be "near" with our clock shift
    // We pick a fixture that is 25 min away by shifting the clock
    // First navigate, then look for any match card and read its kickoff time
    await openPredictionsTab(page);

    // Find all article time elements and pick the first future one
    const timeEls = await page.locator('article time[datetime]').all();
    let nearFutureISO = null;

    for (const el of timeEls) {
      const dt = await el.getAttribute('datetime').catch(() => null);
      if (dt && new Date(dt).getTime() > Date.now()) {
        nearFutureISO = dt;
        break;
      }
    }

    if (!nearFutureISO) {
      // No future matches with datetime attribute — use a hardcoded 2026 fixture date
      nearFutureISO = '2026-06-11T15:00:00Z'; // Opening match
    }

    // Reload the page with the clock shifted to 25 min before that kickoff
    await shiftClockToNearKickoff(page, nearFutureISO, 25);
    await page.reload();
    await openPredictionsTab(page);

    // PRÓXIMO badge: orange border, has text like "PRÓXIMO" or "NEXT"
    const proximoBadge = page.locator(
      '[class*="border-orange"], text=/PRÓXIMO|NEXT|próximo/i'
    ).first();

    await expect(proximoBadge).toBeVisible({ timeout: 10_000 });
  });

  test('MM:SS countdown timer is visible when near kickoff', async ({ page }) => {
    const nearFutureISO = '2026-06-11T15:00:00Z';
    await shiftClockToNearKickoff(page, nearFutureISO, 25);
    await page.reload();
    await openPredictionsTab(page);

    // Timer format: "24:59" or similar MM:SS
    const timer = page.locator('text=/^\\d{2}:\\d{2}$/').first();
    await expect(timer).toBeVisible({ timeout: 10_000 });
  });

  test('Timer counts down (two readings differ)', async ({ page }) => {
    const nearFutureISO = '2026-06-11T15:00:00Z';
    await shiftClockToNearKickoff(page, nearFutureISO, 25);
    await page.reload();
    await openPredictionsTab(page);

    const timer = page.locator('text=/^\\d{2}:\\d{2}$/').first();
    await timer.waitFor({ state: 'visible', timeout: 10_000 });

    const t1 = await timer.innerText();
    await page.waitForTimeout(2_000);
    const t2 = await timer.innerText();

    expect(t1).not.toBe(t2);
  });
});

test.describe('COUNTDOWN — EN VIVO badge at kickoff', () => {
  test('EN VIVO badge appears when match is at/past kickoff', async ({ page }) => {
    const pastKickoffISO = '2026-06-11T15:00:00Z';
    // Shift to 1 minute AFTER kickoff
    await shiftClockToNearKickoff(page, pastKickoffISO, -1);
    await page.reload();
    await openPredictionsTab(page);

    // EN VIVO badge: green, pulsing
    const liveBadge = page.locator(
      '[class*="border-emerald"], [class*="animate-ping"], text=/EN VIVO|LIVE/i'
    ).first();

    await expect(liveBadge).toBeVisible({ timeout: 10_000 });
  });

  test('EN VIVO shows 0-0 score display', async ({ page }) => {
    const pastKickoffISO = '2026-06-11T15:00:00Z';
    await shiftClockToNearKickoff(page, pastKickoffISO, -1);
    await page.reload();
    await openPredictionsTab(page);

    // Should show "0-0" or "0 - 0" for live match
    const scoreDisplay = page.locator('text=/0\\s*[-–]\\s*0/').first();
    await expect(scoreDisplay).toBeVisible({ timeout: 10_000 });
  });

  test('Timer stops at 00:00 when match starts', async ({ page }) => {
    const pastKickoffISO = '2026-06-11T15:00:00Z';
    await shiftClockToNearKickoff(page, pastKickoffISO, -1);
    await page.reload();
    await openPredictionsTab(page);

    // Should NOT show MM:SS countdown (it's past kickoff)
    // Wait a moment for any timer to settle
    await page.waitForTimeout(1_000);

    const timer = page.locator('text=/^\\d{2}:\\d{2}$/').first();
    const timerVisible = await timer.isVisible().catch(() => false);

    if (timerVisible) {
      const text = await timer.innerText();
      expect(text).toBe('00:00');
    } else {
      // Timer not shown at all — acceptable (replaced by EN VIVO badge)
      expect(timerVisible).toBe(false);
    }
  });
});

test.describe('COUNTDOWN — far future matches', () => {
  test('No PRÓXIMO badge for matches more than 30 min away', async ({ page }) => {
    // Do not shift clock — default present day (April 2026)
    // World Cup starts June 2026 — all matches are >30 min away
    await openPredictionsTab(page);

    const proximoBadge = page.locator('[class*="border-orange"]').first();
    const isVisible = await proximoBadge.isVisible().catch(() => false);

    // Should not be visible for far-future matches
    expect(isVisible).toBe(false);
  });
});
