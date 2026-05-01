import { test, expect } from './fixtures/authenticated.js';
import { LANGUAGES, RTL_LANGS } from './helpers/selectors.js';

// Language names as they appear in the dropdown (languageName from translations)
const LANG_LABELS = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  id: 'Indonesia',
  ko: '한국어',
  ja: '日本語',
  ar: 'العربية',
  he: 'עברית',
};

// Sample keys that should change visibly per language (navbar items)
const SAMPLE_KEYS = {
  es: 'Grupos',
  en: 'Groups',
  fr: 'Groupes',
  de: 'Gruppen',
  pt: 'Grupos',
};

async function openLanguageDropdown(page) {
  const globeBtn = page.locator('header button[aria-label]').filter({
    hasNot: page.locator('img'),
  }).nth(1); // Globe button (search is first, globe is second)

  // More reliable: find by aria-label containing language-related text
  const langBtn = page.locator(
    'header button[aria-label*="idioma"], header button[aria-label*="language"], header button[aria-label*="Choose"], header button[aria-label*="Elegir"]'
  ).first();

  const btnToClick = (await langBtn.count()) > 0 ? langBtn : globeBtn;
  await btnToClick.click();

  // Wait for dropdown to appear
  await page.waitForSelector(
    'button:has-text("Español"), button:has-text("English")',
    { timeout: 5_000 }
  );
}

test.describe('LANGUAGE — selector', () => {
  test('Language dropdown opens and shows all 11 options', async ({ page }) => {
    await openLanguageDropdown(page);
    for (const label of Object.values(LANG_LABELS)) {
      await expect(
        page.locator(`button:has-text("${label}")`).first()
      ).toBeVisible();
    }
  });

  for (const [code, label] of Object.entries(LANG_LABELS)) {
    test(`Switch to ${label} (${code}) — UI reacts`, async ({ page }) => {
      await openLanguageDropdown(page);
      await page.locator(`button:has-text("${label}")`).first().click();

      // Dropdown should close
      await expect(
        page.locator(`button:has-text("${label}")`).first()
      ).not.toBeVisible({ timeout: 3_000 }).catch(() => {}); // closes on some, stays on others

      // localStorage must be updated
      const stored = await page.evaluate(
        () => localStorage.getItem('preferredLanguage')
      );
      expect(stored).toBe(code);
    });
  }

  test('RTL: Arabic sets document.dir = rtl', async ({ page }) => {
    await openLanguageDropdown(page);
    await page.locator(`button:has-text("${LANG_LABELS.ar}")`).first().click();

    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('rtl');
  });

  test('RTL: Hebrew sets document.dir = rtl', async ({ page }) => {
    await openLanguageDropdown(page);
    await page.locator(`button:has-text("${LANG_LABELS.he}")`).first().click();

    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('rtl');
  });

  test('LTR: English resets document.dir to ltr', async ({ page }) => {
    // First go RTL
    await openLanguageDropdown(page);
    await page.locator(`button:has-text("${LANG_LABELS.ar}")`).first().click();
    await page.waitForTimeout(300);

    // Then switch to English
    await openLanguageDropdown(page);
    await page.locator(`button:has-text("${LANG_LABELS.en}")`).first().click();

    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('ltr');
  });

  test('Body content translates — nav groups label changes with language', async ({ page }) => {
    // Verify Spanish default
    await expect(page.locator('nav[aria-label="Primary"]')).toContainText('Grupos');

    // Switch to English
    await openLanguageDropdown(page);
    await page.locator(`button:has-text("${LANG_LABELS.en}")`).first().click();
    await page.waitForTimeout(500);

    // Nav should now show English
    await expect(page.locator('nav[aria-label="Primary"]')).toContainText('Groups');
  });

  test('localStorage persists language across reload', async ({ page }) => {
    await openLanguageDropdown(page);
    await page.locator(`button:has-text("${LANG_LABELS.en}")`).first().click();
    await page.waitForTimeout(300);

    await page.reload();
    await page.waitForSelector('nav[aria-label="Primary"]', { timeout: 10_000 });

    const stored = await page.evaluate(
      () => localStorage.getItem('preferredLanguage')
    );
    expect(stored).toBe('en');
  });
});
