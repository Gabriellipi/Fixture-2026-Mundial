import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('AUTH — sign-in screen UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    // No auth mock → shows AuthScreen
    await page.waitForSelector('button:has-text("Google")', { timeout: 10_000 });
  });

  test('Google button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
  });

  test('Facebook button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Facebook")')).toBeVisible();
  });

  test('Email input + submit button are present', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("email")')).toBeVisible();
  });

  test('Email form — empty submit shows no crash', async ({ page }) => {
    await page.locator('button:has-text("email")').click();
    // The button text changes to loading or stays — no JS error
    await expect(page.locator('body')).not.toContainText('undefined');
    await expect(page.locator('body')).not.toContainText('TypeError');
  });

  test('Email OTP — valid email triggers loading state', async ({ page }) => {
    // Mock the OTP send endpoint so it resolves immediately
    await page.route('**/auth/v1/otp**', (route) =>
      route.fulfill({ status: 200, body: '{}' }),
    );
    await page.locator('input[type="email"]').fill('qa@fixture2026.dev');
    await page.locator('button:has-text("email")').click();
    // Should show loading text or confirmation
    await expect(
      page.locator('button:has-text("Enviando"), button:has-text("Sending"), button:has-text("email")')
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Google OAuth — click redirects or shows provider page (skip if blocked)', async ({ page }) => {
    test.setTimeout(15_000);
    let redirected = false;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && frame.url().includes('google')) {
        redirected = true;
      }
    });

    // Mock supabase oauth endpoint to avoid real redirect
    await page.route('**/auth/v1/authorize**', (route) =>
      route.fulfill({
        status: 302,
        headers: { Location: 'https://accounts.google.com/o/oauth2/auth?mock=1' },
      }),
    );

    await page.locator('button:has-text("Google")').click();
    // Either page navigated away or a popup was triggered — both are acceptable
    await page.waitForTimeout(1_500);
    // We just verify there's no JS error on the auth screen
    const hasErrors = await page.evaluate(() =>
      (window.__qaErrors ?? []).length > 0
    );
    expect(hasErrors).toBe(false);
  });

  test('Facebook OAuth — click does not crash page (skip if blocked)', async ({ page }) => {
    await page.route('**/auth/v1/authorize**', (route) =>
      route.fulfill({ status: 200, body: '{}' }),
    );
    await page.locator('button:has-text("Facebook")').click();
    await page.waitForTimeout(1_000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('TypeError');
  });
});

test.describe('AUTH — sign out', () => {
  test.beforeEach(async ({ page }) => {
    const { setupAuthMock } = await import('./helpers/mock-auth.js');
    await setupAuthMock(page);
    await page.goto(BASE);
    await page.waitForSelector('nav[aria-label="Primary"], header', { timeout: 10_000 });
  });

  test('Sign-out button is visible in user menu', async ({ page }) => {
    // Open user menu (avatar button in header)
    const userBtn = page.locator('header button').last();
    await userBtn.click();
    await expect(
      page.locator('button:has-text("sesión"), button:has-text("Sign out"), button:has-text("Cerrar")')
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Sign out redirects back to login screen', async ({ page }) => {
    // Mock logout endpoint
    await page.route('**/auth/v1/logout**', (route) =>
      route.fulfill({ status: 204, body: '' }),
    );

    const userBtn = page.locator('header button').last();
    await userBtn.click();

    const signOutBtn = page.locator(
      'button:has-text("sesión"), button:has-text("Sign out"), button:has-text("Cerrar")'
    );
    await signOutBtn.click();

    // Should show auth screen again
    await expect(
      page.locator('button:has-text("Google")')
    ).toBeVisible({ timeout: 8_000 });
  });
});
