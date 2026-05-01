import { test as base } from '@playwright/test';
import { setupAuthMock } from '../helpers/mock-auth.js';

/**
 * Extended test fixture that:
 *  1. Mocks all Supabase calls before navigation
 *  2. Navigates to the app and waits for the authenticated dashboard
 *  3. Exposes a `navigateTo(tab)` helper for state-based routing
 */
export const test = base.extend({
  // Authenticated page — ready for testing post-login features
  page: async ({ page }, use) => {
    await setupAuthMock(page);
    await page.goto('/');

    // Wait for either the main nav (authenticated) or auth screen
    await page.waitForSelector(
      'nav[aria-label="Primary"], button:has-text("Google")',
      { timeout: 10_000 },
    );

    await use(page);
  },

  // Helper: navigate to an app tab by clicking the nav button
  navigateTo: async ({ page }, use) => {
    const go = async (tabLabel) => {
      // Try desktop nav first
      const desktopBtn = page.locator(`nav[aria-label="Primary"] button`).filter({
        hasText: new RegExp(tabLabel, 'i'),
      }).first();

      if (await desktopBtn.isVisible().catch(() => false)) {
        await desktopBtn.click();
        return;
      }

      // Fall back to bottom nav (mobile)
      const bottomBtn = page.locator('nav').last().locator('button').filter({
        hasText: new RegExp(tabLabel, 'i'),
      }).first();

      await bottomBtn.click();
    };
    await use(go);
  },
});

export { expect } from '@playwright/test';
